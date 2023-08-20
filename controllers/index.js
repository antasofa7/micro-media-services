const fs = require('fs');
const isBase64 = require('is-base64');
const base64Img = require('base64-img');

const { Media } = require('../models');

module.exports = {
  get: async (req, res) => {
    const media = await Media.findAll({
      attributes: ['id', 'image'],
    });

    const mappedMedia = media.map((e) => {
      e.image = `${req.get('host')}/${e.image}`;
      return e;
    });

    return res.json({
      status: 'success',
      data: mappedMedia,
    });
  },

  post: (req, res) => {
    const { image } = req.body;

    if (
      !isBase64(image, {
        mimeRequired: true,
      })
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid base image!',
      });
    }

    base64Img.img(
      image,
      './public/images',
      Date.now(),
      async (err, filepath) => {
        if (err) {
          return res.status(400).json({
            status: 'error',
            message: err.message,
          });
        }

        // /public/images/122jjjkj399a.jpg
        const filename = filepath.split('/').pop();

        const media = await Media.create({
          image: `images/${filename}`,
        });

        return res.json({
          status: 'success',
          data: {
            id: media.id,
            image: `${req.get('host')}/images/${filename}`,
          },
        });
      },
    );
  },

  delete: async (req, res) => {
    const { id } = req.params;

    const media = await Media.findByPk(id);

    if (!media) {
      return res.status(404).json({
        status: 'error',
        message: 'Media not found!',
      });
    }

    fs.unlink(`./public/${media.image}`, async (err) => {
      if (err) {
        return res.status(400).json({
          status: 'error',
          message: err.message,
        });
      }

      await media.destroy();

      return res.json({
        status: 'success',
        message: 'Image deleted!',
      });
    });
  },
};
