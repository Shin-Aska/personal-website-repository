<?php
    class Nonce {

        public function generateToken($length = 10){
            //set up random characters
            $chars='1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM';
            //get the length of the random characters
            $char_len = strlen($chars)-1;
            //store output
            $output = '';
            //iterate over $chars
            while (strlen($output) < $length) {
                /* get random characters and append to output till the length of the output 
                 is greater than the length provided */
                $output .= $chars[ rand(0, $char_len) ];
            }
            //return the result
            return $output;
        }
    }
?>