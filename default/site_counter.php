<?php
    define("site_host", "");
    define("site_username", "");
    define("site_password", "");
    define("site_database", "");
    
    function get_page_count($pageName) {

        $count = 0;
        try {
            if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
                $ip = $_SERVER['HTTP_CLIENT_IP'];
            } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
                $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
            } else {
                $ip = $_SERVER['REMOTE_ADDR'];
            }

            $ip = "$ip@$pageName";

            
            $update = false;
            $mysqli = new mysqli(site_host, site_username, site_password, site_database);
            if ($mysqli->connect_errno) {
                return $count;
            }

            $mysqli->query("DELETE FROM ip_log WHERE time_interacted <= NOW() - INTERVAL 7 DAY");
            $stmt = $mysqli->prepare("SELECT id, ip_address, time_interacted FROM ip_log WHERE ip_address = ?");
            $stmt->bind_param("s", $ip_address);
            $ip_address = $ip;
            $stmt->execute();
            if ($result = $stmt->get_result()) {
                if ($result->num_rows == 0) {
                    $update = true;
                    $stmt = $mysqli->prepare("INSERT INTO ip_log(ip_address) VALUES(?)");
                    $stmt->bind_param("s", $ip_address);
                    $ip_address = $ip;
                    $stmt->execute();
                    
                }
                $result->free_result();
            }

            $stmt = $mysqli->prepare("SELECT id, ip_address, time_interacted FROM ip_log WHERE ip_address = ? AND time_interacted >= NOW() - INTERVAL 1 DAY");
            $stmt->bind_param("s", $ip_address);
            $ip_address = $ip;
            $stmt->execute();
            if ($result = $stmt->get_result()) {
                if ($result->num_rows == 0) {
                    $update = true;
                }
                $stmt = $mysqli->prepare("UPDATE ip_log SET time_interacted = NOW() WHERE ip_address = ?");
                $stmt->bind_param("s", $ip_address);
                $ip_address = $ip;
                $stmt->execute();
                $result->free_result();
            }
            
            $stmt = $mysqli->prepare("SELECT id, page, count FROM site_counter WHERE page = ?");
            $stmt->bind_param("s", $page_name);
            $page_name = $pageName;
            $stmt->execute();
            if ($result = $stmt->get_result()) {
                if ($result->num_rows == 0) {
                    $stmt = $mysqli->prepare("INSERT INTO site_counter(page, count) VALUES(?, ?)");
                    $stmt->bind_param("si", $page, $visit_count);
                    $page = $pageName;
                    $visit_count = 0;
                    $stmt->execute();
                }
                $result->free_result();
            }

            $stmt = $mysqli->prepare("SELECT id, page, count FROM site_counter WHERE page = ?");
            $stmt->bind_param("s", $page_name);
            $page_name = $pageName;
            $stmt->execute();
            if ($result = $stmt->get_result()) {
                $chosen_id = -1;
                while($obj = $result->fetch_object()){
                    $count = $obj->count;
                    $chosen_id = $obj->id;
                }
                $result->free_result();
                if ($update) {  
                    if ($chosen_id != -1) {
                        $stmt = $mysqli->prepare("UPDATE site_counter SET count = count + 1 WHERE id = ?");
                        $stmt->bind_param("i", $counter_id);
                        $counter_id = $chosen_id;
                        $stmt->execute();
                    }
                    $count = $count + 1;
                    $cached_info = fopen($pageName . ".txt", "w");
                    fwrite($cached_info, $count);
                    fclose($cached_info);
                }
            }
        }
        catch(Exception $ex) {
            try {
                if (file_exists($pageName . ".txt")) {
                    $cached_info = fopen($pageName . ".txt", "r");
                    $count = fread($cached_info,filesize($pageName . ".txt"));
                    fclose($cached_info);
                }
            }
            catch(Exception $ex2) {

            }
        }

        return $count;
    }
?>