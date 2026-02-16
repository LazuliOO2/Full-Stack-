import { Router } from "express";
import Place from "./model.js";
import { JWTVerify } from "../../utils/jwt.js";
import { connectDb } from "../../config/db.js";
import { downloadImage } from "../../utils/imageDownloader.js";
import { __dirname } from "../../server.js";
import multer from "multer"; // [Importe o multer]
import fs from "fs"; // [Importe o fs para renomear arquivos]

const router = Router();
const uploadMiddleware = multer({ dest: "tmp/" }); // [Configura a pasta de destino]

router.get("/", async (req, res) => {
connectDb();

  try {
    const placeDocs = await Place.find();

    res.json(placeDocs);
  } catch (error) {
    console.error(error);
    res.status(500).json("Deu erro encontrar as Acomodações");
  }
});

router.get("/owner", async (req, res) => {
  connectDb();

  try {
    const userInfo = await JWTVerify(req);

    try {
      const placeDocs = await Place.find({ owner: userInfo._id });

      res.json(placeDocs);
    } catch (error) {
      console.error(error);
      res.status(500).json("Deu erro encontrar as Acomodações");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json("Deu erro verificar o usuário");
  }
});


router.get("/:id", async (req, res) => {
  connectDb();

  const { id: _id } = req.params;

  try {
    const placeDoc = await Place.findOne({ _id });

    res.json(placeDoc);
  } catch (error) {
    console.error(error);
    res.status(500).json("Deu erro encontrar aa Acomodação");
  }
});

router.put("/:id", async (req, res) => {
  connectDb();

  const { id: _id } = req.params;

  const {
    title,
    city,
    photos,
    description,
    extras,
    price,
    perks,
    checkin,
    checkout,
    guests,
  } = req.body;

  try {
    const updatedPlaceDoc = await Place.findOneAndUpdate(
      { _id },
      {
        title,
        city,
        photos,
        description,
        extras,
        perks,
        price,
        checkin,
        checkout,
        guests,
      }
    );

    res.json(updatedPlaceDoc);
  } catch (error) {
    console.error(error);
    res.status(500).json("Deu erro ao atualizar a acomodação");
  }
});


router.post("/", async (req, res) => {
connectDb();

  let owner;

  try {
    const tokenData = await JWTVerify(req);
    owner = tokenData._id;
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: "Usuário não está logado" });
  }

  const {
    title,
    city,
    photos,
    description,
    extras,
    price,
    perks,
    checkin,
    checkout,
    guests,
  } = req.body;

  try {
    const newPlaceDoc = await Place.create({
      owner,
      title,
      city,
      photos,
      description,
      extras,
      perks,
      price,
      checkin,
      checkout,
      guests,
    });

    res.json(newPlaceDoc);
  } catch (error) {
    console.error(error);
    res.status(500).json("Deu erro ao criar o novo lugar");
  }
});

router.post("/upload/link", async (req, res) => {
  const { link } = req.body;

  try {
    const filename = await downloadImage(link, `${__dirname}/tmp/`);

    res.json(filename);
  } catch (error) {
    console.error(error);
    res.status(500).json("Deu baixar a imagem.");
  }
});

// Rota para upload via Arquivo Local
// 'photos' é o nome do campo que enviaremos do front-end
// 100 é o limite máximo de arquivos por vez
router.post("/upload", uploadMiddleware.array("photos", 10), (req, res) => {
  const uploadedFiles = [];
  
  // O Multer coloca os arquivos em req.files
  for (let i = 0; i < req.files.length; i++) {
    const { path, originalname } = req.files[i];
    
    // Descobre a extensão (ex: .jpg, .png)
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    
    // Cria o novo caminho com a extensão
    const newPath = path + "." + ext;
    
    // Renomeia o arquivo no disco
    fs.renameSync(path, newPath);
    
    // Adiciona apenas o nome do arquivo para retornar ao front
    // Removemos o "tmp/" ou "tmp\" do caminho para salvar limpo
    uploadedFiles.push(newPath.replace("tmp/", "").replace("tmp\\", "")); 
  }
  
  res.json(uploadedFiles);
});

export default router;