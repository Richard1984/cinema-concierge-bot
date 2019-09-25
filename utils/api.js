require('../env/env')

const axios = require('axios')

const { API_KEY } = process.env

class Api {
  constructor (api) {
    this.instance = axios.create({
      baseURL: api,
      params: {
        api_key: API_KEY
      }
    })
  }

  async getMovie (id, language) {
    return this.instance.get('/movie/' + id, {
      params: {
        language,
        api_key: API_KEY
      }
    })
  }

  async getNowPlayingMovies (language, page, region) {
    return this.instance.get('/movie/now_playing', {
      params: {
        language,
        // page,
        region,
        api_key: API_KEY
      }
    })
  }

  async getUpcomingMovies (language, page, region) {
    return this.instance.get('/movie/upcoming', {
      params: {
        language,
        // page,
        region,
        api_key: API_KEY
      }
    })
  }
}

module.exports = (api) => new Api(api)
