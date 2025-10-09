const express = require('express')
const axios = require('axios');
const FocusController = require('../api/controllers/FocusController.js')

const focusController = new FocusController()

const router = express.Router()

/**
 * @swagger
 * /hello:
 *   get:
 *     summary: Retorna uma mensagem de hello world
 *     tags: [Teste]
 *     responses:
 *       200:
 *         description: Mensagem de hello world
 */
router.get('/hello', (req, res) => {
  res.send('Hello world')
})

/**
 * @swagger
 * /noticias:
 *  get:
 *    summary: Busca notícias sobre queimadas na API externa GNews
 *    tags: [Focos]
 *    responses:
 *      200:
 *        description: Uma lista de artigos de notícias
 *      500:
 *        description: Erro ao buscar notícias externas
 */
router.get('/noticias', async (req, res) => {
  try {
    // 1. Pega a chave da API do ficheiro .env do servidor
    const apiKey = process.env.GNEWS_API_KEY;
    if (!apiKey) {
      throw new Error('Chave da API de notícias não configurada no servidor.');
    }

    // 2. Prepara o pedido para o GNews
    const baseUrl = 'https://gnews.io/api/v4/search';
    
    // 3. Define os parâmetros num objeto para que o Axios os codifique corretamente
    const params = {
      q: 'queimadas AND (Amazônia OR floresta OR cerrado OR Pantanal OR Norte OR Sul OR Sudeste OR Nordeste OR Caatinga OR Pampa OR "Mata Atlântica" OR "Centro-Oeste" OR Brasil) NOT ("LA" OR "Los Angeles")',
      country: 'br',
      max: 10,
      token: apiKey
    };

    // 4. Adiciona o filtro de data para a paginação, se ele for enviado pelo front-end
    if (req.query.to) {
      params.to = req.query.to;
    }
    
    // 5. Faz o pedido ao GNews
    const response = await axios.get(baseUrl, { params: params });

    // 6. Adiciona os cabeçalhos para impedir o cache do navegador
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', 0);

    // 7. Envia a resposta do GNews de volta para o front-end
    res.json(response.data);

  } catch (error) {
    // 8. O nosso "modo detetive" para erros
    console.error("--- INÍCIO DO ERRO DETALHADO DO AXIOS ---");
    if (error.response) {
      console.error('Dados da Resposta:', error.response.data);
      console.error('Status do Erro:', error.response.status);
      console.error('Cabeçalhos da Resposta:', error.response.headers);
    } else if (error.request) {
      console.error('Nenhuma resposta recebida do GNews:', error.request);
    } else {
      console.error('Erro ao configurar o pedido para o GNews:', error.message);
    }
    console.error("--- FIM DO ERRO DETALHADO DO AXIOS ---");
    res.status(500).json({ error: 'Falha ao buscar notícias externas.' });
  }
});

/**
 * @swagger
 * /focusEstateMonthYear/{month}/{year}:
 *   get:
 *     summary: Quantidade mensal de focos de cada estado por mes e ano
 *     tags: [Focos]
 *     parameters:
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quantidade mensal de focos de cada estado
 *       500:
 *         description: Erro interno no servidor
 *
 */
router.get('/focusEstateMonthYear/:month/:year', focusController.getMonthlyFocusByEstate)

/**
 * @swagger
 * /focusYearEstateYear/{estate}/{year}:
 *   get:
 *     summary: Quantidade de focos de um estado em cada mes do ano
 *     tags: [Focos]
 *     parameters:
 *       - in: path
 *         name: estate
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quantidade de focos mensal do estado
 *       500:
 *         description: Erro interno no servidor
 */
router.get('/focusYearEstateYear/:estate/:year', focusController.getYearFocusFromEstate)

/**
 * @swagger
 * /focusRegionYear/{year}:
 *   get:
 *     summary: Total de focos de cada regiao em um ano
 *     tags: [Focos]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Focos de cada regiao em um ano
 *       500:
 *         description: Erro interno no servidor
 */
router.get('/focusRegionYear/:year', focusController.getFocusByRegion)

/**
 * @swagger
 * /focusBiomesYear/{year}:
 *   get:
 *     summary: Total de focos de cada bioma em um ano
 *     tags: [Focos]
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Focos de cada bioma em um ano
 *       500:
 *         description: Erro interno no servidor
 */
router.get('/focusBiomesYear/:year', focusController.getFocusFromBiomes)

/**
 * @swagger
 * /focusEstateAllYears/{estate}:
 *   get:
 *     summary: Quantidade de focos mensal de um estado de 2003 a 2024
 *     tags: [Focos]
 *     parameters:
 *       - in: path
 *         name: estate
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quantidade de focos mensal de um estado de 2003 a 2024
 *       500:
 *         description: Erro interno no servidor
 */
router.get('/focusEstateAllYears/:estate', focusController.getAllYearsFocusFromEstate)

/**
 * @swagger
 * /focusDailyEstateMonth/{month}/{estate}:
 *   get:
 *     summary: Quantidade de focos em cada dia de um estado em um mes
 *     tags: [Focos]
 *     parameters:
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: estate
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quantidade de focos em cada dia de um estado em um mes
 *       500:
 *         description: Erro interno no servidor
 */
router.get('/focusDailyEstateMonth/:month/:estate', focusController.getDailyFocusByEstateMonth)

/**
 * @swagger
 * /focusDailyEstatesMonth/{month}:
 *   get:
 *     summary: Tatal de focos no mes de cada estado em 2025
 *     tags: [Focos]
 *     parameters:
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tatal de focos no mes de cada estado em 2025
 *       500:
 *         description: Erro interno no servidor
 */
router.get('/focusDailyEstatesMonth/:month', focusController.getDailyFocusFromEstatesByMonth)

module.exports = router
