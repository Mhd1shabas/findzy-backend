const multer = require("multer");
const path = require("path");

// configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // We will save to "uploads/" folder at the root level of findzy-server 
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`);
    },
});

// configure file filter
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error("Error: Images Only (jpeg, jpg, png)!"), false);
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: fileFilter,
});

module.exports = upload;
