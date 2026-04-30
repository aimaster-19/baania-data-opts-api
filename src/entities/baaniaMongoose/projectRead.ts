import mongoose from 'mongoose'

export const mongooseProjectReadSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  created: { type: String },
  data: {
    address: {
      subdistrict_en: { type: String },
      province_en: { type: String },
      postcode: { type: Number },
      transport: { type: String },
      district_en: { type: String },
      nearby: { type: String },
      subdistrict_id: { type: Number },
      address_th: { type: String },
      district_th: { type: String },
      province_id: { type: Number },
      neighbors: { type: String },
      subdistrict_th: { type: String },
      address_en: { type: String },
      district_id: { type: Number },
      province_th: { type: String },
      landzone: {
        name: { type: String },
        id: { type: String }
      }
    },
    ads: {
      retarget_google_content_type: { type: String },
      has_retarket_ads: { type: Boolean },
      retarget_content_id: { type: String },
      retarget_facebook_content_type: { type: String },
      retarget_price_start: { type: String }
    },
    created: { type: Number },
    detail: {
      area_total: {
        wa: { type: Number },
        ngan: { type: Number },
        rai: { type: Number }
      },
      num_lift_service: { type: String },
      num_unit_type: { type: String },
      num_lift: { type: String },
      num_unit: { type: Number },
      area_shared: { type: String },
      num_floor: { type: Number },
      ratio_parking: { type: String },
      insurance_condition: { type: String },
      num_parking: { type: String }
    },
    developer: {
      image: {
        thumbnail: { type: String },
        alt: { type: String },
        title: { type: String },
        url: { type: String }
      },
      capital: { type: Number },
      website: { type: String },
      address: { type: String },
      reg_num: { type: String },
      director: { type: String },
      keyId: { type: String },
      business_segment: { type: String },
      contact_info: { type: String },
      display_name: { type: String },
      branch: { type: String },
      title_th: { type: String },
      bank_id: { type: String },
      location: {
        bottom: { type: String },
        lon: { type: String },
        right: { type: String },
        top: { type: String },
        left: { type: String },
        lat: { type: String }
      },
      title_en: { type: String },
      id: { type: String },
      department: { type: String },
      email: { type: String }
    },
    email: { type: String },
    facebook: { type: String },
    facility: {
      has_pool: { type: Number },
      has_meeting: { type: String },
      info_fitness: { type: String },
      info_other_fac: { type: String },
      info_pool: { type: String },
      has_fitness: { type: Number },
      info_playground: { type: String },
      has_park: { type: String },
      info_meeting: { type: String },
      has_security: { type: String },
      has_playground: { type: Number },
      info_security: { type: String },
      info_clubhouse: { type: String },
      has_clubhouse: { type: Number },
      info_park: { type: String },
      has_service_bus: { type: String }
    },
    financial: {
      price_land: { type: String },
      price_start: { type: Number },
      price_end_per_unit: { type: String },
      ratio_yield: { type: String },
      price_start_per_unit: { type: String },
      unitof_price_facility: { type: String },
      insurance_cost: { type: String },
      price_end: { type: String },
      price_facility: { type: String },
      num_yield: { type: String },
      start_price_not_found: { type: Boolean },
      not_show_start_price: { type: Boolean }
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
    general: {
      building_amount: { type: String },
      highlight: { type: String },
      mgnt_status: { type: String },
      promotion: { type: String },
      promotion_start: { type: String },
      promotion_stop: { type: String },
      slogan: { type: String },
      status: { type: String },
      detail: { type: String }
    },
    id: { type: String },
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
    info: {
      search_keyword: { type: String },
      code: { type: String },
      hasBlogic: { type: Boolean },
      posted: { type: String },
      title_th: { type: String },
      title_en: { type: String }
    },
    line: { type: String },
    location: {
      heading: { type: String },
      bottom: { type: String },
      lon: { type: Number },
      right: { type: String },
      top: { type: String },
      left: { type: String },
      lat: { type: Number }
    },
    meta: {
      meta_keywords: { type: String },
      meta_description: { type: String }
    },
    progress: {
      progress_overall: { type: String },
      progress_system: { type: String },
      date_start: { type: String },
      progress_architect: { type: String },
      date_finish: { type: String },
      progress_structure: { type: String },
      progress_wiring: { type: String }
    },
    promote: {
      promote_review: { type: Number },
      promote_level: { type: Number },
      promote_end_date: { type: Number },
      promote_search: { type: Number },
      promote_recommend: { type: Number },
      promote_map: { type: Number },
      promote_compare: { type: Number },
      promote_list: { type: Number },
      promote_comment: { type: String },
      promote_start_date: { type: Number }
    },
    property_type: [
      {
        title_th: { type: String },
        title_en: { type: String },
        id: { type: Number }
      }
    ],
    published: { type: Number },
    selloffice: {
      contact_number: { type: String },
      address_selloffice: { type: String }
    },
    transaction: [],
    uid: { type: String },
    unittype: [
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
          ngan: { type: Number },
          rai: { type: Number }
        },
        price_start: { type: Number },
        num_bed: { type: Number },
        unittype_keyId: { type: String },
        published: { type: Number },
        title: { type: String },
        url: {
          alias_th: { type: String },
          alias_en: { type: String }
        },
        area_usable: { type: Number },
        num_bath: { type: Number },
        title_alt: { type: String },
        id: { type: String },
        num_parking: { type: Number },
        num_floor: { type: Number },
        num_aircond: { type: String },
        count_room_dining: { type: String },
        count_room_guest: { type: String },
        sold_out: { type: Boolean },
        not_show_start_price: { type: Boolean },
        start_price_not_found: { type: Boolean }
      }
    ],
    updated: { type: Number },
    url: {
      alias_th: { type: String },
      alias_en: { type: String }
    },
    video: {
      video: {
        thumbnail: { type: String },
        title: { type: String },
        url: { type: String }
      },
      aerial: {
        thumbnail: { type: String },
        title: { type: String },
        url: { type: String }
      },
      customer: {
        thumbnail: { type: String },
        title: { type: String },
        url: { type: String }
      }
    },
    website: { type: String },
    exreview: { type: String },
    livingscore: { type: String }
  },
  geopoint: {
    coordinates: [{ type: Number }],
    type: { type: String }
  },
  isShouldUpdate: { type: String },
  keyId: { type: String },
  updated: { type: String },
  deletedAt: { type: String }
})
