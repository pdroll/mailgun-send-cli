# mailgun-send-cli

Easily send mail, even HTML emails, from the command line using the Mailgun API.

## Installation

```
npm install mailgun-send-cli -g
```

Or if you're using [Yarn](https://yarnpkg.com/):

```
yarn global add mailgun-send-cli
```

## Usage

```
mailgun-send [options]
```

You will be prompted to enter your Mailgun [API Key](https://mailgun.com/app/account/security) and [domain](https://mailgun.com/app/domains) on your first use. These values will be used on every subsequent call until the `--reset` flag is used to reset them.

### Examples

Plain text email:

```
mailgun-send -f me@example.com -t you@example.com -s 'Email sent via Mailgun from the command line' -T 'Hello there! The mailgun-send-cli tool is really cool. You should check it out!'
```

HTML email:

```
mailgun-send -f me@example.com -t you@example.com -s 'HTML Email sent via Mailgun from the command line' -H ~/path/to/html/file.html
```

### Options

####`-s, --subject <value>`
Subject of Email. Required.

#### `-t, --to <value>`
Email address of recipient of email. Required.

#### `-f, --from <value>`
Email address of email sender. Required.

#### `-T, --text <value>`
Text to send as body of email. Must specify this or `--htmlpath`.

#### `-H, --htmlpath <value>`
Path to HTML file to send as email. Must specify this or `--text`.

#### `-R, --reset`
Reset Mailgun API key and Domain. You will be prompted to enter these again.

#### `-h, --help`
Output usage information

#### `-V, --version`
Output the version number


## Troubleshooting

If it says your email was successfully sent, but you don't see the email in your inbox, check the [logs](https://mailgun.com/app/logs) of your mailgun account for more information.

Be sure to use a [verified domain](https://documentation.mailgun.com/quickstart-sending.html#verify-your-domain) to remove the "sent via Mailgun.org" message from your emails and increase your monthly free send limit from 300 to 10,000.

See [Mailgun's FAQ's](https://documentation.mailgun.com/faqs.html) for more information.




