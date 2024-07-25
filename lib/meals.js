const { MongoClient } = require("mongodb");
import { v2 as cloudinary } from "cloudinary";

import slugify from "slugify";
import xss from "xss";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API,
  api_secret: process.env.CLOUD_SECRET,
});

const uri = process.env.MONGODB_URL;
const client = new MongoClient(uri);

export async function getMeals() {
  try {
    const uri = process.env.MONGODB_URL;
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("meals");
    const coll = db.collection("menu");
    const menu = await coll.find().toArray();
    return menu;
  } finally {
    await client.close();
  }
}

export async function getMeal(slug) {
  try {
    const uri = process.env.MONGODB_URL;
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("meals");
    const coll = db.collection("menu");
    const meal = await coll.findOne({ slug });
    return meal;
  } catch (e) {
    console.log(e);
  } finally {
    await client.close();
  }
}

export async function saveMeal(meal) {
  const uri = process.env.MONGODB_URL;
  const client = new MongoClient(uri);
  meal.slug = slugify(meal.title, { lower: true });
  meal.instructions = xss(meal.instructions);

  const bufferedImage = await meal.image.arrayBuffer();
  const buffer = new Uint8Array(bufferedImage);
  // const extension = meal.image.name.split(".").pop();
  // const fileName = `${meal.slug}.${extension}`;

  await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({}, function (error, result) {
        if (error) {
          reject(error);
          return;
        }
        meal.image = result.public_id;
        resolve(result);
      })
      .end(buffer);
  });

  try {
    await client.connect();
    const db = client.db("meals");
    const coll = db.collection("menu");
    const res = await coll.insertOne(meal);
  } finally {
    await client.close();
  }
}
