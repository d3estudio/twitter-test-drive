# Twitter Test-Drive

## Installation

TDD uses Docker, so make sure it is installed before procceeding.

1. Create a file named `settings.json`, which must be a object with the following keys, used to authenticate against the Twitter API:
    - `twitterConsumerKey`
    - `twitterConsumerSecret`
    - `twitterCallbackUri`
2. Fire up your terminal, `cd` to this repository and run:
```
$ docker-compose up
```
3. After the build is complete, a running instance will be available at [http://localhost:3000/](http://localhost:3000/)

## Adding a superuser
Only superusers can add a new superuser, but initially, there will be none installed on your instance. To do so, run the `super-add` script, located in your repository root, replacing `handle` with your Twitter handle.

```
$ ./super-add handle
```
