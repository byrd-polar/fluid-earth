# systemd unit files

Automatically updates data files at specificied times. Paths and (lackof)
timezone are hardcoded for the `fever` server; will need modifications if
switching host.

## Installation

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
