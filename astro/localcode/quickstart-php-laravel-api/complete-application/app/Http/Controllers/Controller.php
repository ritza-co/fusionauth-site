<?php

namespace App\Http\Controllers;

use Illuminate\Auth\Access\AuthorizationException;

abstract class Controller
{
    protected function checkRoles(string ...$roles): void
    {
        $payload = (array) request()->attributes->get('jwt_payload');
        $rolesFromJwt = (array) ($payload['roles'] ?? []);

        foreach ($roles as $role) {
            if (in_array($role, $rolesFromJwt, true)) {
                return;
            }
        }

        throw new AuthorizationException('Proper role not found for user.');
    }
}
