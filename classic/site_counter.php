<?php
    function get_page_count($pageName) {
        $count = 0;
        $mysqli = new mysqli("host","username","password","database");
        if ($mysqli->connect_errno) {
            return $count;
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
            if ($chosen_id != -1) {
                $mysqli->query("UPDATE site_counter SET count = count + 1 WHERE id = " . $chosen_id);
            }
            $count = $count + 1;
        }

        return $count;
    }
?>