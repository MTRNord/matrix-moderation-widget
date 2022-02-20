# Matrix Moderation Widget for Mjolnir

This is an experimental widget to be used in the Mjolnir moderation room.

Use at your own risk! If you break your bot and it is not an bug your issue will be closed.
Using this currently is extremely dangerous!

Room: [#mjolnir-widget:nordgedanken.dev](https://matrix.to/#/#mjolnir-widget:nordgedanken.dev)

## Screenshots
![Screenshot](images/screenshot.png)

## How to start in dev mode

1. Follow https://create-react-app.dev/docs/using-https-in-development for your os
2. Run `npm start`

## How to build

Run `npm run build`.

## How to add

Something like this (room_id and https are required)

`/addwidget https://localhost:3000?room_id=$matrix_room_id`

## Hosted instance

A hosted widget is at https://moderation_widget.nordgedanken.dev/ you can add it via
`/addwidget https://moderation_widget.nordgedanken.dev?room_id=$matrix_room_id`