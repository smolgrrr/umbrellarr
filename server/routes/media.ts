import { MediaStatus, MediaType } from '@server/constants/media';
import { getRepository } from '@server/datasource';
import Media from '@server/entity/Media';
import type {
  MediaResultsResponse,
  MediaWatchDataResponse,
} from '@server/interfaces/api/mediaInterfaces';
import { Permission } from '@server/lib/permissions';
import { getSettings } from '@server/lib/settings';
import logger from '@server/logger';
import { Router } from 'express';
import type { FindOneOptions } from 'typeorm';
import { In } from 'typeorm';

const mediaRoutes = Router();

mediaRoutes.get('/', async (req, res, next) => {
  const mediaRepository = getRepository(Media);

  const pageSize = req.query.take ? Number(req.query.take) : 20;
  const skip = req.query.skip ? Number(req.query.skip) : 0;

  let statusFilter = undefined;

  switch (req.query.filter) {
    case 'available':
      statusFilter = MediaStatus.AVAILABLE;
      break;
    case 'partial':
      statusFilter = MediaStatus.PARTIALLY_AVAILABLE;
      break;
    case 'allavailable':
      statusFilter = In([
        MediaStatus.AVAILABLE,
        MediaStatus.PARTIALLY_AVAILABLE,
      ]);
      break;
    case 'processing':
      statusFilter = MediaStatus.PROCESSING;
      break;
    case 'pending':
      statusFilter = MediaStatus.PENDING;
      break;
    default:
      statusFilter = undefined;
  }

  let sortFilter: FindOneOptions<Media>['order'] = {
    id: 'DESC',
  };

  switch (req.query.sort) {
    case 'modified':
      sortFilter = {
        updatedAt: 'DESC',
      };
      break;
    case 'mediaAdded':
      sortFilter = {
        mediaAddedAt: 'DESC',
      };
  }

  try {
    const [media, mediaCount] = await mediaRepository.findAndCount({
      order: sortFilter,
      where: statusFilter && {
        status: statusFilter,
      },
      take: pageSize,
      skip,
    });
    return res.status(200).json({
      pageInfo: {
        pages: Math.ceil(mediaCount / pageSize),
        pageSize,
        results: mediaCount,
        page: Math.ceil(skip / pageSize) + 1,
      },
      results: media,
    } as MediaResultsResponse);
  } catch (e) {
    next({ status: 500, message: e.message });
  }
});

mediaRoutes.post<
  {
    id: string;
    status: 'available' | 'partial' | 'processing' | 'pending' | 'unknown';
  },
  Media
>(
  '/:id/:status',
  async (req, res, next) => {
    const mediaRepository = getRepository(Media);

    const media = await mediaRepository.findOne({
      where: { id: Number(req.params.id) },
    });

    if (!media) {
      return next({ status: 404, message: 'Media does not exist.' });
    }

    const is4k = Boolean(req.body.is4k);

    switch (req.params.status) {
      case 'available':
        media[is4k ? 'status4k' : 'status'] = MediaStatus.AVAILABLE;
        if (media.mediaType === MediaType.TV) {
          // Mark all seasons available
          media.seasons.forEach((season) => {
            season[is4k ? 'status4k' : 'status'] = MediaStatus.AVAILABLE;
          });
        }
        break;
      case 'partial':
        if (media.mediaType === MediaType.MOVIE) {
          return next({
            status: 400,
            message: 'Only series can be set to be partially available',
          });
        }
        media.status = MediaStatus.PARTIALLY_AVAILABLE;
        break;
      case 'processing':
        media.status = MediaStatus.PROCESSING;
        break;
      case 'pending':
        media.status = MediaStatus.PENDING;
        break;
      case 'unknown':
        media.status = MediaStatus.UNKNOWN;
    }

    await mediaRepository.save(media);

    return res.status(200).json(media);
  }
);

mediaRoutes.delete(
  '/:id',
  async (req, res, next) => {
    try {
      const mediaRepository = getRepository(Media);

      const media = await mediaRepository.findOneOrFail({
        where: { id: Number(req.params.id) },
      });

      await mediaRepository.remove(media);

      return res.status(204).send();
    } catch (e) {
      logger.error('Something went wrong fetching media in delete request', {
        label: 'Media',
        message: e.message,
      });
      next({ status: 404, message: 'Media not found' });
    }
  }
);

mediaRoutes.get<{ id: string }, MediaWatchDataResponse>(
  '/:id/watch_data',
  async (req, res, next) => {

    const media = await getRepository(Media).findOne({
      where: { id: Number(req.params.id) },
    });

    if (!media) {
      return next({ status: 404, message: 'Media does not exist.' });
    }

    try {

      const response: MediaWatchDataResponse = {};

      return res.status(200).json(response);
    } catch (e) {
      logger.error('Something went wrong fetching media watch data', {
        label: 'API',
        errorMessage: e.message,
        mediaId: req.params.id,
      });
      next({ status: 500, message: 'Failed to fetch watch data.' });
    }
  }
);

export default mediaRoutes;
