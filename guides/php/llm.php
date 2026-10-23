<?php
// Retired local endpoint. This file never reads a question or contacts a service.
// The production /php/llm.php mapping must be verified separately; see
// docs/assistant-inventory.md before claiming production retirement.
http_response_code(410);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
echo json_encode([
    'error' => 'assistant_endpoint_retired',
    'message' => 'Guide assistants now run locally in the browser. Reload the guide.'
]);
exit;
