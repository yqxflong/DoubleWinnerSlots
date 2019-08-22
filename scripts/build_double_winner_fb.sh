#change the target file path by yourself 

./js_configs_replace.sh res_double_winner RELEASE
./sync_flavor.sh res_double_winner
./gen_res_list.sh res_double_winner
./build_fb.sh res_double_winner
