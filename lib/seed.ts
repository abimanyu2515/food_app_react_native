import { ID } from "react-native-appwrite";
import { appwriteConfig, databases, storage } from "./appwrite";
import dummyData from "./data";

interface Category {
  name: string;
  description: string;
}

interface Customization {
  name: string;
  price: number;
  type: "topping" | "side" | "size" | "crust" | string; // extend as needed
}

interface MenuItem {
  name: string;
  description: string;
  image_url: string;
  price: number;
  rating: number;
  calories: number;
  protein: number;
  category_name: string;
  customizations: string[]; // list of customization names
}

interface DummyData {
  categories: Category[];
  customizations: Customization[];
  menu: MenuItem[];
}

// ensure dummyData has correct shape
const data = dummyData as DummyData;

async function clearAll(collectionId: string): Promise<void> {
  const list = await databases.listDocuments(
    appwriteConfig.databaseId,
    collectionId,
  );

  await Promise.all(
    list.documents.map((doc) =>
      databases.deleteDocument(
        appwriteConfig.databaseId,
        collectionId,
        doc.$id,
      ),
    ),
  );
}

async function clearStorage(): Promise<void> {
  const list = await storage.listFiles(appwriteConfig.bucketId);

  await Promise.all(
    list.files.map((file) =>
      storage.deleteFile(appwriteConfig.bucketId, file.$id),
    ),
  );
}

async function uploadImageToStorage(imageUrl: string) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();

    const filename = imageUrl.split("/").pop() || `file-${Date.now()}.jpg`;

    const file = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      new File([blob], filename, { type: blob.type }),
    );

    return storage.getFileViewURL(appwriteConfig.bucketId, file.$id);
  } catch (error) {
    console.error(`Error uploading image ${imageUrl}:`, error);
    // Return the original URL if upload fails
    return imageUrl;
  }
}

async function seed(): Promise<void> {
  try {
    // 1. Clear all
    console.log("🧹 Clearing existing data...");
    await clearAll(appwriteConfig.categoriesTable);
    await clearAll(appwriteConfig.customizationsTable);
    await clearAll(appwriteConfig.menuTable);
    await clearAll(appwriteConfig.menuCustomizationTable);
    await clearStorage();
    console.log("✅ Data cleared");

    // 2. Create Categories
    console.log("📁 Creating categories...");
    const categoryMap: Record<string, string> = {};
    for (const cat of data.categories) {
      const doc = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.categoriesTable,
        ID.unique(),
        cat,
      );
      categoryMap[cat.name] = doc.$id;
    }
    console.log(`✅ Created ${data.categories.length} categories`);

    // 3. Create Customizations
    console.log("🎨 Creating customizations...");
    const customizationMap: Record<string, string> = {};
    for (const cus of data.customizations) {
      const doc = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.customizationsTable,
        ID.unique(),
        {
          name: cus.name,
          price: cus.price,
          type: cus.type,
        },
      );
      customizationMap[cus.name] = doc.$id;
    }
    console.log(`✅ Created ${data.customizations.length} customizations`);

    // 4. Create Menu Items
    console.log("🍔 Creating menu items...");
    const menuMap: Record<string, string> = {};
    for (const item of data.menu) {
      try {
        console.log(`  Uploading image for: ${item.name}`);
        const uploadedImage = await uploadImageToStorage(item.image_url);

        const doc = await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.menuTable,
          ID.unique(),
          {
            name: item.name,
            description: item.description,
            image_url: uploadedImage,
            price: item.price,
            rating: item.rating,
            calories: item.calories,
            protein: item.protein,
            categories: categoryMap[item.category_name],
          },
        );

        menuMap[item.name] = doc.$id;

        // 5. Create menu_customizations
        for (const cusName of item.customizations) {
          await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.menuCustomizationTable,
            ID.unique(),
            {
              menu: doc.$id,
              customizations: customizationMap[cusName],
            },
          );
        }
      } catch (error) {
        console.error(`  ❌ Error creating menu item "${item.name}":`, error);
        throw error;
      }
    }
    console.log(
      `✅ Created ${data.menu.length} menu items with customizations`,
    );

    console.log("✅ Seeding complete.");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

export default seed;
