<?php

use App\Providers\AppServiceProvider;

// :snippet-start: providers
return [
    AppServiceProvider::class,
    App\FusionAuth\Providers\FusionAuthServiceProvider::class,
];
// :snippet-end: