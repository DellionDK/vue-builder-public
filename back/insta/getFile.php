<?php

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, 'https://graph.instagram.com/'.$_POST['id'].'?fields=id,media_type,media_url,username,timestamp&access_token='.$_POST['token']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

$result = curl_exec($ch);
if (curl_errno($ch)) {
    echo 'Error:' . curl_error($ch);
}
echo json_encode($result);
curl_close($ch);