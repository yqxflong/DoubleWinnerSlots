#!/bin/sh
USER_HOME=$(eval echo ~${SUDO_USER})
#echo ${USER_HOME}
versionName=`jq -r '.releaseInfo.versionName' ../../../res_double_winner/resource_dirs.json`
rsync -av -e "ssh -i ${USER_HOME}/Documents/slots-team-ec2.pem" ../../../publish/html5/ ec2-user@slots-res-server-new.tuanguwen.com:/home/ec2-user/double_winner_fb/${versionName}/