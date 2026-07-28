# Quickstart: Drupal with FusionAuth

This repository contains a Drupal app that uses [FusionAuth](https://fusionauth.io/), as the authentication provider.

## Prerequisites

- [Docker](https://www.docker.com): The quickest way to start FusionAuth. (There are [other ways](/docs/v1/tech/installation-guide/))

If you want to run Drupal on your host machine instead of in Docker, you also need:

- [PHP](https://www.php.net/downloads.php) 8.1.0+
- [Composer](https://getcomposer.org/)
- [GD extension](https://www.php.net/manual/en/book.image.php)

> NOTE: Drupal 10 requires `PHP 8.1.0 or higher` and `MariaDB 10.3.7+` or `MySQL/Percona 5.7.8+` in order to run.

## Run FusionAuth and Drupal

Clone this repository to your local machine and then enter the `fusionauth-quickstart-php-drupal-web` directory.

Open a bash terminal in the root of this directory and run the following command to start the latest Drupal and FusionAuth containers:

```bash
docker compose pull && docker compose up -d
```

You should see the following running containers:

- `fa`: The FusionAuth container.
- `faDb`: FusionAuth's PostrgreSQL database.
- `drupal`: The Drupal container.
- `mysql`: Drupal's MySQL database.


The FusionAuth configuration files make use of a unique feature of FusionAuth, called [Kickstart](https://fusionauth.io/docs/v1/tech/installation-guide/kickstart): when FusionAuth comes up for the first time, it will look at the [Kickstart file](./kickstart/kickstart.json) and mimic API calls to configure FusionAuth for use when it is first run.

FusionAuth will be initially configured with these settings:

* Your client Id is: `e9fdb985-9173-4e01-9d73-ac2d60d1dc8e`
* Your client secret is: `super-secret-secret-that-should-be-regenerated-for-production`
* Your example username is `richard@example.com` and your password is `password`.
* Your admin username is `admin@example.com` and your password is `password`.
* Your fusionAuthBaseUrl is 'http://localhost:9011/'

You can log into the [FusionAuth admin UI](http://localhost:9011/admin) with the admin user above and look around if you want, but with Docker/Kickstart you don't need to.

## Configure the Drupal complete application

The `complete-application` directory contains the Drupal app files, configured to authenticate with FusionAuth running in Docker.

If the `drupal` and `mysql` containers are running then it means the Drupal application is up.

However, the Drupal database isn't populated yet. Configure it with the command below:

```bash
cd complete-application
docker run --rm --init -v .:/app -w /app composer:2.6 composer install --ignore-platform-req=ext-gd
./setupDrupal.sh
```

## Log in to the Drupal App

You can now access the Drupal app by opening a browser and navigating to http://localhost.

If and only if you use Linux, where Docker does not run in a virtual machine, edit your `/etc/hosts` file and add the line `127.0.0.1 host.docker.internal`, so that your browser redirects correctly when trying to reach the FusionAuth login page.

To login to the application with FusionAuth, click the Login button and then on the user login page located at http://localhost/user/login you can click on the button labeled `Login with generic`.

That will redirect you to the FusionAuth login page where you can login with the following credentials:

* Username: `richard@example.com`
* Password: `password`

Once you log in, you will be redirected back to the Drupal app's account page (http://localhost/account) where you will see your username, along with the logout button.

In the main navigation menu, you will see a link to the makechange page (http://localhost/makechange) where you can navigate to and "make change" with the form located there. The account page will keep track of the last value you entered.

You're currently logged in as a user with the role of `authenticated user` which means you can only access the `account`, `makechange` and `home` pages.

## Advanced usage

If you want to explore the application with more depth as an admin user, you can do so by logging out and then entering the following credentials at the user login page:

* Username: `admin`
* Password: `password`

If for whatever reason you want to change the credentials for the Drupal application's MySQL database, make sure to update the `settings.php` file located at `./complete-application/web/sites/default/settings.php` with the new credentials.

By default they are:

```php
$databases['default']['default'] = array (
  'database' => 'drupaldb',
  'username' => 'drupal',
  'password' => 'verybadpassword',
  'prefix' => '',
  'host' => 'mysqls',
  'port' => '3307',
  'isolation_level' => 'READ COMMITTED',
  'namespace' => 'Drupal\\mysql\\Driver\\Database\\mysql',
  'driver' => 'mysql',
  'autoload' => 'core/modules/mysql/src/Driver/Database/mysql/',
);
```

## Restarting Docker containers

If one of the containers fails to start, or you wish to reset the system, run the following commands to stop and remove all containers and volumes:

```bash
docker compose kill
docker compose rm -fv
docker compose down -v
```

`docker compose kill` stops all running containers, `docker compose rm -fv` removes them and then `docker compose down -v` removes the volumes.

You'll then need to re-run `docker compose up -d` to start the containers again.

> **NOTE**: If you ever want to reset the FusionAuth system, delete the volumes created by docker-compose as we explained above by executing `docker compose down -v`.


## Drush

The command-line tool, Drush, is installed in the Drupal container and you can make use of it to perform various tasks.

One such task is to import or export config for the database. To do so, open a bash terminal in the root of the `fusionauth-quickstart-php-drupal-web` directory and run the following command to enter the Drupal container:

```bash
docker compose exec web bash
```

Once inside the container, you can run the following command to export the config:

```bash
vendor/bin/drush cex
```

Or to import config:

```bash
vendor/bin/drush cim
```

> **NOTE**: Drupal's config directory is usually located at `web/sites/default/files/config_some_hash/sync/`.
>
> You can do manual imports by copying the code in a particular .yml file the `config/sync` directory, visiting the import page at http://localhost/admin/config/development/configuration/single/import, selecting the corresponding config type and pasting the code into the text area.

Other popular commands include:

- `vendor/bin/drush cr`: Clears the cache,
- `vendor/bin/drush pm-enable <module name>`: Enables a module,
- `vendor/bin/drush updb`: Updates the database,
- `vendor/bin/drush uli`: Generates a one-time login link for a user,
- and many more.

For a full list of commands, visit https://www.drush.org/12.2.0/commands/all/.


## Further Information

Visit https://fusionauth.io/quickstarts/quickstart-php-drupal-web for a step by step guide on how to build the Drupal integration with FusionAuth manually.

## Troubleshooting

* I get `This site can’t be reached  localhost refused to connect.` when I click the Login button

Ensure FusionAuth is running in the Docker container.  You should be able to login as the admin user, `admin@example.com` with the password of `password` at http://localhost:9011/admin.

* I get an error `/usr/bin/env: 'php\r': No such file or directory` when trying to run drush commands.

Incorrect line endings are known to cause this issue. To fix the issue, you need to convert the line endings of the file from Windows to Unix. this can be done by use of the `dos2unix` command. You can install `dos2unix` by running the following command inside the Drupal container:

```bash
apt-get update && apt-get install -y dos2unix
```

Once installed, you can convert the line endings of the file by running the following command inside the Drupal container:

```bash
dos2unix /opt/drupal/vendor/bin/drush
```

