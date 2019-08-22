#!/bin/sh
versionName=`jq -r '.releaseInfo.versionName' ../../../res_double_winner/resource_dirs.json`
USER_HOME=$(eval echo ~${SUDO_USER})
echo ${USER_HOME}

ssh -i ${USER_HOME}/Documents/slots-team-ec2.pem ec2-user@slots-res-server-new.tuanguwen.com "mkdir -p /home/ec2-user/double_winner/${versionName}"
rsync -av -e "ssh -i ${USER_HOME}/Documents/slots-team-ec2.pem" ../../../res_double_winner/ ec2-user@slots-res-server-new.tuanguwen.com:/home/ec2-user/double_winner/$versionName/res_double_winner
rsync -av -e "ssh -i ${USER_HOME}/Documents/slots-team-ec2.pem" ../../../assets_config/res_double_winner/ ec2-user@slots-res-server-new.tuanguwen.com:/home/ec2-user/double_winner/assets_config/