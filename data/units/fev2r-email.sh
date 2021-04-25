#!/bin/sh

/usr/sbin/sendmail -t <<MAIL
To: zqianem@gmail.com, gravina.2@osu.edu
From: systemd <root@$(hostname)>
Subject: [$(hostname)] Status of $1
Content-Transfer-Encoding: 8bit
Content-Type: text/plain; charset=UTF-8

$(systemctl status --full "$1")
MAIL
