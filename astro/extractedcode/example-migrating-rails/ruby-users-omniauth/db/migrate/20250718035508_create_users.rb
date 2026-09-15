class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :email
      t.string :name
      t.string :provider, null: false
      t.string :uid, null: false
      t.string :image_url
      t.text :raw_info
      t.boolean :active, default: true

      t.timestamps
    end
    
    add_index :users, [:provider, :uid], unique: true
    add_index :users, :email
  end
end
