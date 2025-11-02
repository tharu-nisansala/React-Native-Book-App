import express from 'express';
import Book from '../models/Book.js';
import cloudinary from '../lib/cloudinary.js';
import  protectRoute  from '../middleware/auth.middleware.js';

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
    try {
        const { title, caption, rating, image } = req.body;

    // Validation
    if (!title || !caption || !rating || !image) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // upload the image to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;

    //save book to database
    const newBook = new Book({
        title,
        caption,
        rating,
        image: imageUrl,
        user: req.user._id,
    });
    await newBook.save();

    res.status(201).json({ message: "Book created successfully", book: newBook });
    

   } catch (error) {
    console.error("Error creating book:", error);
    res.status(500).json({ message: "Internal server error" });
   }
}
);

router.get("/", protectRoute, async (req, res) => {
    try {
        const page=parseInt(req.query.page) || 1;
        const limit=parseInt(req.query.limit) || 10;
        const skip=(page-1)*limit;
        

        const books = await Book.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate("user","username profileImage");

        const totalBooks = await Book.countDocuments();
        res.send({books,currentPage:page, totalBooks, totalPages: Math.ceil(totalBooks/limit)});
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

//get recommended books by logged in user
router.get("/user", protectRoute, async (req, res) => {
    try {
        const books = await Book.find({user:req.user._id}).sort({ createdAt: -1 }).populate("user","username profileImage");
        res.status(200).json({books});
    } catch (error) {
        console.error("Error fetching user's books:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.delete("/:id", protectRoute, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if(!book){
            return res.status(404).json({message:"Book not found"});
        }
        //check if the user is the owner of the book
        if(book.user.toString() !== req.user._id.toString()){
            return res.status(403).json({message:"Forbidden: You are not allowed to delete this book"});
        }

        //delete the image from cloudinary
        if (book.image && book.image.includes("cloudinary")) {
            try {
                const publicId = book.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            }catch (deleteError) {
                console.error("Error deleting image from Cloudinary:", deleteError);
            }
        }
        await book.deleteOne();
        res.status(204).json({message:"Book deleted successfully"});
    } catch (error) {
        console.error("Error deleting book:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;