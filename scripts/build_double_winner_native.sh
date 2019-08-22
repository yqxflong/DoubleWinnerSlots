./js_configs_replace.sh res_double_winner RELEASE
./sync_flavor.sh res_double_winner
./build_native.sh res_double_winner true
./gen_res_md5_server.sh res_double_winner true
