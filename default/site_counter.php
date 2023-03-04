<?php
    define("site_host", "");
    define("site_username", "");
    define("site_password", "");
    define("site_database", "");

    function get_page_count($pageName) {

        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            $ip = $_SERVER['REMOTE_ADDR'];
        }

        $count = 0;
        $update = false;
        $mysqli = new mysqli(site_host, site_username, site_password, site_database);
        if ($mysqli->connect_errno) {
            return $count;
        }

        $mysqli->query("DELETE FROM ip_log WHERE time_interacted <= NOW() - INTERVAL 7 DAY");
        if ($result = $mysqli->query("SELECT id, ip_address, time_interacted FROM ip_log WHERE ip_address = '$ip'")) {
            if ($result->num_rows == 0) {
                $update = true;
                $mysqli->query("INSERT INTO ip_log(ip_address) VALUES('$ip')");
            }
            $result->free_result();
        }

        if ($result = $mysqli->query("SELECT id, ip_address, time_interacted FROM ip_log WHERE ip_address = '$ip' AND time_interacted >= NOW() - INTERVAL 1 DAY")) {
            if ($result->num_rows == 0) {
                $update = true;
            }
            $mysqli->query("UPDATE ip_log SET time_interacted = NOW() WHERE ip_address = '$ip'");
            $result->free_result();
        }
        
        if ($result = $mysqli->query("SELECT id, page, count FROM site_counter WHERE page = '$pageName'")) {
            if ($result->num_rows == 0) {
                $mysqli->query("INSERT INTO site_counter(page, count) VALUES('$pageName', 0)");
            }
            $result->free_result();
        }

              
        if ($result = $mysqli->query("SELECT id, page, count FROM site_counter WHERE page = '$pageName'")) {
            $chosen_id = -1;
            while($obj = $result->fetch_object()){
                $count = $obj->count;
                $chosen_id = $obj->id;
            }
            $result->free_result();
            if ($update) {  
                if ($chosen_id != -1) {
                    $mysqli->query("UPDATE site_counter SET count = count + 1 WHERE id = " . $chosen_id);
                }
                $count = $count + 1;
            }
        }

        return $count;
    }
?>