# systemd unit files

Automatically updates data files at specificied times. Paths hardcoded for the
`fever` server, currently.

## Installation on Linux system

1. Link all `.service`s:

```
systemctl link [full path to service file]
```

2. Enable and start all `.timer`s:

```
systemctl enable [full path to timer file]
systemctl start [timer name].timer
```

### Example for one service/timer combination

```
systemctl link /export/data/fev2r/repository/data/units/fev2r-gfs.service
systemctl enable /export/data/fev2r/repository/data/units/fev2r-gfs.timer
systemctl start fev2r-gfs.timer
```
