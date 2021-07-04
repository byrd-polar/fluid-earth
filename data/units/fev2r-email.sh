#!/bin/sh

/usr/sbin/sendmail -t <<MAIL
To: zqianem@gmail.com, gravina.2@osu.edu
From: systemd <root@$(hostname)>
Subject: [$(hostname)] Status of $1
Content-Transfer-Encoding: 8bit
Content-Type: text/plain; charset=UTF-8

$(systemctl status --full "$1")

Please ssh into $(hostname) and run the following commands:

    cd /export/data/fev2r/repository
    npm run data:$(echo "$1" | cut -d'.' -f1 | cut -d'-' -f2)

To investigate the cause of the issue, run the following command:

    journalctl -u "$1" $(systemctl show -p MainPID "$1" | sed 's/Main/_/g')

and type a capital "G" to jump to the end of the page.
MAIL
