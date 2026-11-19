import mongoose from 'mongoose'

const { Mixed } = mongoose.Schema.Types

/**
 * Reusable image shape used across main / overall / project images.
 * Fields are nullable in the source data, so all are plain optional strings.
 */
const imageSchema = {
  title: { type: String },
  alt: { type: String },
  url: { type: String },
  thumbnail: { type: String },
  webp_main: { type: String },
  webp_thumbnail: { type: String }
}

/**
 * Schema for the `unittype` read-model collection.
 *
 * Design — EMBEDDED, matching the upstream pipeline.
 *   This collection is written by the pipeline with a full embedded project
 *   snapshot under `data.project` (images, the project's unit_type[] list,
 *   footnotes, etc.). The schema mirrors that exact shape so API-created /
 *   API-updated records stay structurally identical to pipeline records and
 *   downstream consumers (e.g. reading `data.project.images.main.url`) don't
 *   break. Do NOT normalize this to a reference key unless the pipeline stops
 *   writing it.
 *
 * Conventions (match the `project` collection / upstream pipeline):
 *   - created / updated / data.created / data.updated : epoch SECONDS (Number)
 *   - deletedAt : epoch SECONDS (Number) when soft-deleted, else null
 *   - isShouldUpdate : numeric dirty-flag (0 | 1)
 *
 * Blocks that are entirely null in the source (`data.facility`) or empty
 * objects (`data.detail.area_land`) are typed as Mixed so Mongoose never
 * miscasts real values that a single sample cannot reveal.
 */
export const mongooseUnittypeSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  keyId: { type: String },
  created: { type: Number },
  updated: { type: Number },
  isShouldUpdate: { type: Number },
  deletedAt: { type: Number },
  geopoint: {
    coordinates: [{ type: Number }],
    type: { type: String }
  },
  data: {
    id: { type: String },
    uid: { type: String },
    created: { type: Number },
    updated: { type: Number },
    published: { type: Number },

    images: {
      main: {
        thumbnail: { type: String },
        alt: { type: String },
        title: { type: String },
        url: { type: String },
        webp_main: { type: String },
        webp_thumbnail: { type: String }
      },
      overall: [imageSchema]
    },

    address: {
      subdistrict_en: { type: String },
      province_en: { type: String },
      postcode: { type: Number },
      name_th: { type: String },
      district_en: { type: String },
      subdistrict_id: { type: Number },
      district_th: { type: String },
      province_id: { type: Number },
      neighbors: { type: String },
      subdistrict_th: { type: String },
      district_id: { type: Number },
      province_th: { type: String },
      name_en: { type: String }
    },

    financial: {
      price_start: { type: Number },
      not_show_start_price: { type: Boolean },
      start_price_not_found: { type: Boolean }
    },

    // ── Embedded snapshot of the parent project (written by the pipeline) ──
    project: {
      id: { type: String },
      project_keyId: { type: String },
      code: { type: String },
      title_th: { type: String },
      title_en: { type: String },
      grade: { type: String },
      slogan: { type: String },
      livingscore: { type: String },
      info_landlord: { type: String },
      info_shared_prop: { type: String },
      info_designer: { type: String },
      info_land_id: { type: String },
      info_license_id: { type: String },
      info_financial: { type: String },
      project_facebook: { type: String },
      project_website: { type: String },
      project_email: { type: String },
      images: {
        project: {
          thumbnail: { type: String },
          title: { type: String },
          url: { type: String }
        },
        main: {
          thumbnail: { type: String },
          title: { type: String },
          url: { type: String },
          webp_main: { type: String },
          webp_thumbnail: { type: String }
        },
        nearby: { type: String },
        overall: [
          {
            title: { type: String },
            url: { type: String },
            thumbnail: { type: String },
            webp_main: { type: String },
            webp_thumbnail: { type: String }
          }
        ],
        map: {
          thumbnail: { type: String },
          title: { type: String },
          url: { type: String }
        }
      },
      footnote: {
        info_landlord: { type: String },
        info_shared_prop: { type: String },
        info_landzone: { type: String },
        info_designer: { type: String },
        info_land_id: { type: String },
        info_license_id: { type: String },
        info_financial: { type: String }
      },
      video: {
        thumbnail: { type: String },
        title: { type: String },
        url: { type: String }
      },
      url: {
        alias_th: { type: String },
        alias_en: { type: String }
      },
      unit_type: [
        {
          image: {
            title: { type: String },
            url: { type: String },
            thumbnail: { type: String },
            webp_main: { type: String },
            webp_thumbnail: { type: String }
          },
          area_land: {
            area: { type: String },
            wa: { type: Number },
            ngan: { type: String },
            rai: { type: String }
          },
          price_start: { type: Number },
          num_bed: { type: Number },
          num_bath: { type: Number },
          num_parking: { type: Number },
          unittype_keyId: { type: String },
          published: { type: Number },
          title: { type: String },
          title_alt: { type: String },
          url: {
            alias_th: { type: String },
            alias_en: { type: String }
          },
          id: { type: String }
        }
      ]
    },

    general: {
      num_unit: { type: Number },
      highlight: { type: String },
      detail: { type: String },
      status: { type: String }
    },

    property_type: [
      {
        name_th: { type: String },
        name_en: { type: String },
        id: { type: Number }
      }
    ],

    location: {
      heading: { type: String },
      lon: { type: Number },
      lat: { type: Number },
      bottom: { type: Number },
      right: { type: Number },
      top: { type: Number },
      left: { type: Number }
    },

    selloffice: {
      contact_number: { type: String },
      address_selloffice: { type: String }
    },

    developer: {
      id: { type: Number },
      name_th: { type: String },
      name_en: { type: String }
    },

    detail: {
      num_maid: { type: Number },
      // Empty object in the source; kept flexible to avoid miscasting.
      area_land: { type: Mixed },
      num_dinning: { type: Number },
      num_bed: { type: Number },
      num_guest: { type: Number },
      num_kitchen: { type: Number },
      num_living: { type: Number },
      area_usable: { type: Number },
      num_bath: { type: Number },
      num_aircond: { type: Number },
      num_util: { type: Number },
      num_floor: { type: Number },
      is_half_floor: { type: Boolean },
      num_storage: { type: Number },
      num_parking: { type: Number }
    },

    video: {
      thumbnail: { type: String },
      title: { type: String },
      url: { type: String }
    },

    url: {
      alias_th: { type: String },
      alias_en: { type: String }
    },

    meta: {
      meta_keywords: { type: String },
      meta_description: { type: String }
    },

    info: {
      search_keyword: { type: String },
      code: { type: String },
      title_th: { type: String },
      title_en: { type: String }
    },

    // All fields are null in the sample (feature flags / free-text notes);
    // typed as Mixed so real string/number/boolean values are stored as-is.
    facility: { type: Mixed },

    transaction: []
  }
})
