<?php
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, 'https://graph.instagram.com/me/media?fields='.$_POST['id'].',caption&access_token='.$_POST['token']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

$result = curl_exec($ch);
if (curl_errno($ch)) {
    echo 'Error:' . curl_error($ch);
}

echo json_encode($result);
curl_close($ch);