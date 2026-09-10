#!/bin/bash

echo "Waiting for MySQL to be ready..."
until docker exec mysql mysqladmin ping -h localhost -u drupal -pverybadpassword --silent 2>/dev/null; do
  sleep 2
done
echo "MySQL is ready."

echo "Waiting for FusionAuth to be ready..."
until curl -s -o /dev/null -w "%{http_code}" http://localhost:9011/api/health 2>/dev/null | grep -q "200"; do
  sleep 2
done
echo "FusionAuth is ready."

echo "Backing up settings.php..."
docker exec drupal cp /opt/drupal/web/sites/default/settings.php /opt/drupal/web/sites/default/settings.php.bak

echo "Installing Drupal with standard profile..."
docker exec drupal drush site:install standard --account-name=admin --account-pass=password --account-mail=me@example.com --site-name=Changebank --yes

echo "Restoring settings.php..."
docker exec drupal cp /opt/drupal/web/sites/default/settings.php.bak /opt/drupal/web/sites/default/settings.php
docker exec drupal rm /opt/drupal/web/sites/default/settings.php.bak

echo "Setting site UUID to match config..."
docker exec drupal drush config:set system.site uuid 588fbd96-db18-45a5-889e-490d5fed1340 --yes

echo "Deleting shortcut entities to allow config import..."
docker exec drupal drush php-eval "
\$shortcuts = \Drupal::entityTypeManager()->getStorage('shortcut')->loadMultiple();
foreach (\$shortcuts as \$shortcut) {
  \$shortcut->delete();
}
\$shortcut_sets = \Drupal::entityTypeManager()->getStorage('shortcut_set')->loadMultiple();
foreach (\$shortcut_sets as \$set) {
  \$set->delete();
}
"

echo "Importing configuration..."
docker exec drupal drush config:import --yes

echo "Creating users..."
docker exec drupal drush user:create "admin@example.com" --password="password" --mail="admin@example.com"
docker exec drupal drush user:create richard --password="password" --mail="richard@example.com"

echo "Creating authmap entries..."
docker exec mysql mysql -u drupal -pverybadpassword drupaldb -e "
INSERT INTO authmap (uid, provider, authname, data) VALUES
(1, 'openid_connect.generic', 'f8848b92-32f4-47c9-9278-1aeb661567ec', NULL),
(2, 'openid_connect.generic', '568903be-e584-4d0d-851c-c88eabcff588', NULL),
(3, 'openid_connect.generic', '00000000-0000-0000-0000-111111111111', NULL);
"

echo "Creating Home page..."
docker exec drupal drush php-eval "
\$node = \Drupal\node\Entity\Node::create([
  'type' => 'page',
  'title' => 'Home',
  'langcode' => 'en',
  'status' => 1,
  'promote' => 1,
]);
\$node->save();
"

echo "Creating Homepage Block..."
docker exec drupal drush php-eval "
\$block = \Drupal\block_content\Entity\BlockContent::create([
  'type' => 'basic',
  'info' => 'Homepage Block',
  'langcode' => 'en',
  'body' => [
    'value' => '<h2 style=\"color:#096324;\">Welcome to Changebank</h2><p>To get started, log in or create a new account.</p>',
    'format' => 'full_html',
  ],
]);
\$block->save();
"

echo "Creating menu links..."
docker exec drupal drush php-eval "
\$menu_links = [
  ['title' => 'Products', 'uri' => 'internal:/', 'menu_name' => 'main', 'weight' => -49],
  ['title' => 'Services', 'uri' => 'internal:/', 'menu_name' => 'main', 'weight' => -48],
  ['title' => 'About', 'uri' => 'internal:/', 'menu_name' => 'main', 'weight' => -47],
  ['title' => 'Account', 'uri' => 'internal:/account', 'menu_name' => 'changebank-menu', 'weight' => 0],
  ['title' => 'Make Change', 'uri' => 'internal:/makechange', 'menu_name' => 'changebank-menu', 'weight' => 0],
];
foreach (\$menu_links as \$link) {
  \$menu_link = \Drupal\menu_link_content\Entity\MenuLinkContent::create([
    'title' => \$link['title'],
    'link' => ['uri' => \$link['uri']],
    'menu_name' => \$link['menu_name'],
    'weight' => \$link['weight'],
  ]);
  \$menu_link->save();
}
"

echo "Making the files directory writable by the web server..."
docker exec drupal chmod 0755 /opt/drupal/web/sites/default
docker exec drupal chmod -R a+w /opt/drupal/web/sites/default/files

echo "Clearing caches..."
docker exec drupal drush cache:rebuild

echo "Warming caches for the routes the tests use..."
curl -s -o /dev/null http://localhost
curl -s -o /dev/null http://localhost/user/login
curl -s -o /dev/null http://localhost/makechange

echo "Setup complete!"
