import DiscoverSlider from '@server/entity/DiscoverSlider';
import logger from '@server/logger';
import { Router } from 'express';

const discoverSettingRoutes = Router();

discoverSettingRoutes.post('/', async (req, res) => {
  const sliders = req.body as DiscoverSlider[];

  if (!Array.isArray(sliders)) {
    return res.status(400).json({ message: 'Invalid request body.' });
  }

  return res.json(sliders);
});

discoverSettingRoutes.post('/add', async (req, res) => {
  const slider = req.body as DiscoverSlider;

  const newSlider = new DiscoverSlider({
    isBuiltIn: false,
    data: slider.data,
    title: slider.title,
    enabled: false,
    order: -1,
    type: slider.type,
  });

  return res.json(newSlider);
});

export default discoverSettingRoutes;
