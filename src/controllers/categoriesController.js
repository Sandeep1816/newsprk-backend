import prisma from "../prismaClient.js";

export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Add this new function
export const createCategory = async (req, res) => {
  try {
    const { name, slug } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: "Name and slug are required" });
    }

    const category = await prisma.category.create({
      data: { name, slug },
    });

    res.status(201).json(category);
  } catch (err) {
    console.error("Error creating category:", err);
    res.status(500).json({ error: "Failed to create category" });
  }
};
