<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    // The primary key is the FusionAuth user Id (the "sub" claim), so it is a UUID assigned by
    // FusionAuth rather than an auto-incrementing integer, and it must be mass-assignable.
    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
    ];

    protected $hidden = [
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
        ];
    }
}
