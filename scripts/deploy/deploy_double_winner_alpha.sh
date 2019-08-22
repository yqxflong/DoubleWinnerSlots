#change the target file path by yourself 
cd ..
./build_double_winner_alpha.sh
./build_native.sh res_double_winner false
./gen_res_md5_server.sh res_double_winner false
./save_code_to_local.sh res_double_winner false


cd deploy

versionName=`jq -r '.debugInfo.versionName' ../../res_double_winner/resource_dirs.json`

ssh luckywinBeta2 "mkdir -p /usr/share/nginx/html/double_winner/${versionName}"

rsync -av ../../res_double_winner/ luckywinBeta2:/usr/share/nginx/html/double_winner/$versionName/res_double_winner/
rsync -av ../../publish/html5/ luckywinBeta2:/usr/share/nginx/html/double_winner/
rsync -av ../../assets_config/res_double_winner/ luckywinBeta2:/usr/share/nginx/html/double_winner/assets_config/