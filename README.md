# My 9 Cards 🎴✨

A web application inspired by `my9albums.com` built specifically for **Pokémon TCG collectors and fans**. Search over 20,000+ official Pokémon cards using the **TCGdex REST API**, build your ultimate 3x3 card showcase, customize aesthetic themes, and export high-resolution images to share on social media.

Created by **Ed Holloway-George** ([@ptgenius](https://x.com/ptgenius) • [spght.dev](https://spght.dev)).

---

## 🌟 Features

- **3x3 Interactive Showcase Grid**: Select, replace, remove, and drag-and-drop reorder 9 Pokémon cards.
- **TCGdex REST API Search**: Real-time card search with debouncing, type filters, and automated infinite scroll pagination.
- **Aesthetic Light Themes**: 8 light themes inspired by TCG mechanics (*Base Set Holo*, *Secret Rare*, *Delta Metal*, *Fire GX*, *Water VMAX*, *TAG TEAM Gold*, *Psychic EX*, *Tera Crystal*).
- **High-Resolution Export**: Download high-res PNG or JPEG images, or copy directly to your clipboard.
- **Auto-Save Drafts**: Automatically saves your showcase in local storage across browser refreshes.

---

## 🛠️ Tech Stack

- **Framework**: React + TypeScript + Vite
- **Data Source**: [TCGdex REST API](https://tcgdex.dev)
- **Styling**: Vanilla CSS (Custom Design Tokens)
- **Icons**: `lucide-react`
- **Export Engine**: `html-to-image`

---

## 🚀 Running Locally

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)

### Setup & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ed-george/my-nine-cards.git
   cd my-nine-cards
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📄 License

MIT License. Free to use and customize!
