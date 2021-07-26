<?php

$uploadDir = __DIR__ . '/uploads/';

$uploadFile = $uploadDir . basename($_FILES['image']['name']);

$relativePath = '/uploads/' .  basename($_FILES['image']['name']);


if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadFile)) {
   echo json_encode(["msg" =>"File uploaded", "server_url" => $relativePath]);
} else {
   echo json_encode(["msg"=> "Upload error"]);
}