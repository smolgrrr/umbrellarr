import TheMovieDb from '@server/api/themoviedb';
import type {
  TmdbMovieResult,
  TmdbTvResult,
} from '@server/api/themoviedb/interfaces';
import { getSettings } from '@server/lib/settings';
import logger from '@server/logger';
import { mapWatchProviderDetails } from '@server/models/common';
import { mapProductionCompany } from '@server/models/Movie';
import { mapNetwork } from '@server/models/Tv';
import settingsRoutes from '@server/routes/settings';
import { appDataPath, appDataStatus } from '@server/utils/appDataVolume';
import { isPerson } from '@server/utils/typeHelpers';
import { Router } from 'express';
import collectionRoutes from './collection';
import discoverRoutes, { createTmdbWithRegionLanguage } from './discover';
import mediaRoutes from './media';
import movieRoutes from './movie';
import personRoutes from './person';
import requestRoutes from './request';
import searchRoutes from './search';
import tvRoutes from './tv';

const router = Router();

router.get('/status/appdata', (_req, res) => {
  return res.status(200).json({
    appData: appDataStatus(),
    appDataPath: appDataPath(),
  });
});

router.get('/settings/public', async (req, res) => {
  const settings = getSettings();

  if (!(req.user?.settings?.notificationTypes.webpush ?? true)) {
    return res
      .status(200)
      .json({ ...settings.fullPublicSettings, enablePushRegistration: false });
  } else {
    return res.status(200).json(settings.fullPublicSettings);
  }
});
router.use('/settings', settingsRoutes);
router.use('/search',  searchRoutes);
router.use('/discover',  discoverRoutes);
router.use('/request',  requestRoutes);
router.use('/movie',  movieRoutes);
router.use('/tv',  tvRoutes);
router.use('/media',  mediaRoutes);
router.use('/person',  personRoutes);
router.use('/collection',  collectionRoutes);

router.get('/regions',  async (req, res, next) => {
  const tmdb = new TheMovieDb();

  try {
    const regions = await tmdb.getRegions();

    return res.status(200).json(regions);
  } catch (e) {
    logger.debug('Something went wrong retrieving regions', {
      label: 'API',
      errorMessage: e.message,
    });
    return next({
      status: 500,
      message: 'Unable to retrieve regions.',
    });
  }
});

router.get('/languages',  async (req, res, next) => {
  const tmdb = new TheMovieDb();

  try {
    const languages = await tmdb.getLanguages();

    return res.status(200).json(languages);
  } catch (e) {
    logger.debug('Something went wrong retrieving languages', {
      label: 'API',
      errorMessage: e.message,
    });
    return next({
      status: 500,
      message: 'Unable to retrieve languages.',
    });
  }
});

router.get<{ id: string }>('/studio/:id', async (req, res, next) => {
  const tmdb = new TheMovieDb();

  try {
    const studio = await tmdb.getStudio(Number(req.params.id));

    return res.status(200).json(mapProductionCompany(studio));
  } catch (e) {
    logger.debug('Something went wrong retrieving studio', {
      label: 'API',
      errorMessage: e.message,
      studioId: req.params.id,
    });
    return next({
      status: 500,
      message: 'Unable to retrieve studio.',
    });
  }
});

router.get<{ id: string }>('/network/:id', async (req, res, next) => {
  const tmdb = new TheMovieDb();

  try {
    const network = await tmdb.getNetwork(Number(req.params.id));

    return res.status(200).json(mapNetwork(network));
  } catch (e) {
    logger.debug('Something went wrong retrieving network', {
      label: 'API',
      errorMessage: e.message,
      networkId: req.params.id,
    });
    return next({
      status: 500,
      message: 'Unable to retrieve network.',
    });
  }
});

router.get('/genres/movie',  async (req, res, next) => {
  const tmdb = new TheMovieDb();

  try {
    const genres = await tmdb.getMovieGenres({
      language: req.locale ?? (req.query.language as string),
    });

    return res.status(200).json(genres);
  } catch (e) {
    logger.debug('Something went wrong retrieving movie genres', {
      label: 'API',
      errorMessage: e.message,
    });
    return next({
      status: 500,
      message: 'Unable to retrieve movie genres.',
    });
  }
});

router.get('/genres/tv',  async (req, res, next) => {
  const tmdb = new TheMovieDb();

  try {
    const genres = await tmdb.getTvGenres({
      language: req.locale ?? (req.query.language as string),
    });

    return res.status(200).json(genres);
  } catch (e) {
    logger.debug('Something went wrong retrieving series genres', {
      label: 'API',
      errorMessage: e.message,
    });
    return next({
      status: 500,
      message: 'Unable to retrieve series genres.',
    });
  }
});

router.get('/backdrops', async (req, res, next) => {
  const tmdb = createTmdbWithRegionLanguage();

  try {
    const data = (
      await tmdb.getAllTrending({
        page: 1,
        timeWindow: 'week',
      })
    ).results.filter((result) => !isPerson(result)) as (
      | TmdbMovieResult
      | TmdbTvResult
    )[];

    return res
      .status(200)
      .json(
        data
          .map((result) => result.backdrop_path)
          .filter((backdropPath) => !!backdropPath)
      );
  } catch (e) {
    logger.debug('Something went wrong retrieving backdrops', {
      label: 'API',
      errorMessage: e.message,
    });
    return next({
      status: 500,
      message: 'Unable to retrieve backdrops.',
    });
  }
});

router.get('/keyword/:keywordId', async (req, res, next) => {
  const tmdb = createTmdbWithRegionLanguage();

  try {
    const result = await tmdb.getKeywordDetails({
      keywordId: Number(req.params.keywordId),
    });

    return res.status(200).json(result);
  } catch (e) {
    logger.debug('Something went wrong retrieving keyword data', {
      label: 'API',
      errorMessage: e.message,
    });
    return next({
      status: 500,
      message: 'Unable to retrieve keyword data.',
    });
  }
});

router.get('/watchproviders/regions', async (req, res, next) => {
  const tmdb = createTmdbWithRegionLanguage();

  try {
    const result = await tmdb.getAvailableWatchProviderRegions({});
    return res.status(200).json(result);
  } catch (e) {
    logger.debug('Something went wrong retrieving watch provider regions', {
      label: 'API',
      errorMessage: e.message,
    });
    return next({
      status: 500,
      message: 'Unable to retrieve watch provider regions.',
    });
  }
});

router.get('/watchproviders/movies', async (req, res, next) => {
  const tmdb = createTmdbWithRegionLanguage();

  try {
    const result = await tmdb.getMovieWatchProviders({
      watchRegion: req.query.watchRegion as string,
    });

    return res.status(200).json(mapWatchProviderDetails(result));
  } catch (e) {
    logger.debug('Something went wrong retrieving movie watch providers', {
      label: 'API',
      errorMessage: e.message,
    });
    return next({
      status: 500,
      message: 'Unable to retrieve movie watch providers.',
    });
  }
});

router.get('/watchproviders/tv', async (req, res, next) => {
  const tmdb = createTmdbWithRegionLanguage();

  try {
    const result = await tmdb.getTvWatchProviders({
      watchRegion: req.query.watchRegion as string,
    });

    return res.status(200).json(mapWatchProviderDetails(result));
  } catch (e) {
    logger.debug('Something went wrong retrieving tv watch providers', {
      label: 'API',
      errorMessage: e.message,
    });
    return next({
      status: 500,
      message: 'Unable to retrieve tv watch providers.',
    });
  }
});

router.get('/', (_req, res) => {
  return res.status(200).json({
    api: 'Overseerr API',
    version: '1.0',
  });
});

export default router;
