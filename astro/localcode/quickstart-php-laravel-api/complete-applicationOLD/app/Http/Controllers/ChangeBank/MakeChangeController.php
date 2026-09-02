<?php

namespace App\Http\Controllers\ChangeBank;

use App\Http\Controllers\Controller;
use Symfony\Component\HttpFoundation\Response;

use function response;

class MakeChangeController extends Controller
{
    /**
     * Make Change entrypoint for the ChangeBank API.
     *
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public function __invoke(): Response
    {
        $this->checkRoles('teller', 'customer');

        $totalParam = request()->query('total');
        if ($totalParam === null || $totalParam === '') {
            return response()->json(['error' => 'total parameter is required'], 400);
        }

        if (!is_numeric($totalParam)) {
            return response()->json(['error' => 'total must be a number'], 400);
        }

        $total = (float) $totalParam;
        if ($total <= 0) {
            return response()->json(['error' => 'total must be greater than 0'], 400);
        }

        $output = $this->makeChange($total);

        return response()->json($output);
    }

    protected function makeChange(float $total): array
    {
        $message = 'We can make change using';
        $remainingAmount = $total;

        $coins = [
            'quarters' => 0.25,
            'dimes' => 0.10,
            'nickels' => 0.05,
            'pennies' => 0.01,
        ];

        $output = [
            'Message' => $message,
            'Change'  => [],
        ];

        foreach ($coins as $coinName => $value) {
            $coinCount = intval($remainingAmount / $value);
            $remainingAmount = round(($remainingAmount - $coinCount * $value) * 100) / 100;
            $output['Message'] .= " {$coinCount} {$coinName}";
            $output['Change'][] = ['Denomination' => $coinName, 'Count' => $coinCount];
        }

        return $output;
    }
}