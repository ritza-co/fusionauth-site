<?php

namespace App\Http\Controllers\ChangeBank;

use App\Http\Controllers\Controller;
use Symfony\Component\HttpFoundation\Response;

use function response;

class PanicController extends Controller
{
    /**
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function __invoke(): Response
    {
        $this->checkRoles('teller');

        return response()->json([
            'message' => "We've called the police!",
        ]);
    }
}
