# My technical review for shortcut

Here is my calendar availabilities scripts that cover the app specs.
I tried to make it as small and simple as possible.

## What does it do ?

It retrieves specific availabilities for a specific date range.
It covers large ranges of dates, with many availabilites, recurring or not, and with big schedule agenda and busy events.

## How did I do ?

1. By retrieving every availabilites available, create new ones for recurring ones
2. Then by retrieving every busy events concerned
3. Recreate these 2 arrays into small events of 30 minutes (we can change this minute value in the event.js file to quickly adapt your business agenda schedule later if needed). To easily show availabilities per 30 minutes.
4. Filter the availabilities found using `filter` & `some` js array function.
5. Display availabilities into a well formed text.

## Dependencies

- moment
- jest

## Test it !

Clone this repo
`git clone https://github.com/tempSt69/technical-review-shortcut.git`

Install dependencies
`npm install`

Start the main.js
`node main.js`

Start unit tests
`jest main.test.js --config=jest.config.js`

## Have fun

I'd be glad to discuss about other or better possibilities to do it.
