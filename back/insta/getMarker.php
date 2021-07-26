<?php

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, 'https://api.instagram.com/oauth/access_token');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);
$post = array(
    'client_id' => '965784877494602',
    'client_secret' => '*********************',
    'grant_type' => 'authorization_code',
    'redirect_uri' => 'https://domain.com/auth/',
    'code' => $_POST['code']
);
curl_setopt($ch, CURLOPT_POSTFIELDS, $post);

$result = curl_exec($ch);
if (curl_errno($ch)) {
    echo 'Error:' . curl_error($ch);
}
echo json_encode($result);
curl_close($ch);