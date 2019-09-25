require('./env/env')

const Telegraf = require('telegraf')
const Telegram = require('telegraf/telegram')

const api = require('./utils/api')
const url = require('url');

const { TOKEN, API } = process.env

const bot = new Telegraf(TOKEN)
const telegram = new Telegram(TOKEN)

const db = api(API)

bot.command('start', async ({ chat: { id }, from }) => {
  const botInfo = await telegram.getMe()
  const { photos: [[{ file_id }]]} = await telegram.getUserProfilePhotos(botInfo.id)

  telegram.sendPhoto(id, file_id, {
    caption: 'Benvenuto ' + from.first_name + '! \nSono il tuo concierge e sarò al tuo servizio.',
    reply_markup: {
      inline_keyboard: [
        [{
          text: "🍿 Film al cinema 🍿",
          callback_data: "movies_in_theaters"
        }],
        [{
          text: "🎬 Prossimamente 🎬",
          callback_data: "coming_soon"
        }],
        [{
          text: "🗃️ La tua lista 🗃️ (disabilitato)",
          callback_data: "movies_list"
        }]
      ]
    }
  })
})

bot.action('movies_in_theaters', async ({ chat: { id }, answerCbQuery }) => {
  answerCbQuery('🍿 Ecco i film al cinema!')
  const { data } = await db.getNowPlayingMovies('it-IT', 1, 'IT')
  const movies = data.results
  telegram.sendMessage(id, '🍿 Ecco i film al cinema!', {
    reply_markup: {
      inline_keyboard: movies.map(({ id, title }) => {
        return [{
          text: title,
          callback_data: 'movie_' + id
        }]
      })
    }
  })
})

bot.action('coming_soon', async ({ chat: { id }, answerCbQuery }) => {
  answerCbQuery('🎬 Ecco i film che usciranno Prossimamente!')
  const { data } = await db.getUpcomingMovies('it-IT', 1, 'IT')
  const movies = data.results
  telegram.sendMessage(id, '🎬 Ecco i film che usciranno Prossimamente!', {
    reply_markup: {
      inline_keyboard: movies.map(({ id, title }) => {
        return [{
          text: title,
          callback_data: 'movie_' + id
        }]
      })
    }
  })
})

bot.action(new RegExp("^movie_"), async (ctx) => {
  const id = ctx.match.input.substring(6)
  const response = await db.getMovie(id, 'it-IT')
  const movie = response.data

  ctx.answerCbQuery('🎞️ ' + movie.title)

  const stars = '⭐'.repeat((movie.vote_average / 2).toFixed())
  const generi = movie.genres.map(el => el.name).toString().split(",").join(", ")

  telegram.sendPhoto(ctx.chat.id, 'https://image.tmdb.org/t/p/original/' + movie.poster_path, {
    parse_mode: 'markdown',
    caption: `*🎞️ ${movie.title}*\n${movie.vote_average ? '\n*☑️ Voto:* ' + stars : ''}\n*🎭 Generi:* ${generi}\n\n${movie.overview}`,
    reply_markup: {
      inline_keyboard: [
        [{
          text: "👍 Aggiungi alla lista (disabilitato).",
          callback_data: "movies_in_theaters"
        }]
      ]
    }
  })
})

bot.launch()
