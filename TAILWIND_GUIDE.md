# 🎨 TailwindCSS Guide

> Tài liệu cung cấp cú pháp và patterns TailwindCSS được sử dụng trong project CryptoTrading SOA

## 📋 Tổng quan

**TailwindCSS** là utility-first CSS framework, thay vì viết CSS, bạn sử dụng các class có sẵn.

```html
<!-- CSS truyền thống -->
<div class="card">...</div>
<style>
  .card {
    padding: 16px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
</style>

<!-- TailwindCSS -->
<div class="p-4 bg-white rounded-lg shadow">...</div>
```

---

## 🎯 Spacing (Khoảng cách)

### Padding (p)

| Class | CSS | Giá trị |
|-------|-----|---------|
| `p-0` | padding: 0 | 0px |
| `p-1` | padding: 0.25rem | 4px |
| `p-2` | padding: 0.5rem | 8px |
| `p-3` | padding: 0.75rem | 12px |
| `p-4` | padding: 1rem | 16px |
| `p-5` | padding: 1.25rem | 20px |
| `p-6` | padding: 1.5rem | 24px |
| `p-8` | padding: 2rem | 32px |
| `p-10` | padding: 2.5rem | 40px |
| `p-12` | padding: 3rem | 48px |

**Variants:**
```html
<!-- Tất cả các hướng -->
<div class="p-4">padding: 16px</div>

<!-- Trục X (left + right) -->
<div class="px-4">padding-left: 16px; padding-right: 16px</div>

<!-- Trục Y (top + bottom) -->
<div class="py-4">padding-top: 16px; padding-bottom: 16px</div>

<!-- Từng hướng -->
<div class="pt-4">padding-top: 16px</div>
<div class="pr-4">padding-right: 16px</div>
<div class="pb-4">padding-bottom: 16px</div>
<div class="pl-4">padding-left: 16px</div>
```

### Margin (m)

Tương tự padding, thay `p` bằng `m`:

```html
<div class="m-4">margin: 16px</div>
<div class="mx-auto">margin-left: auto; margin-right: auto (center)</div>
<div class="mt-4">margin-top: 16px</div>
<div class="mb-6">margin-bottom: 24px</div>
<div class="ml-2">margin-left: 8px</div>

<!-- Negative margin -->
<div class="-mt-4">margin-top: -16px</div>
```

### Gap (Khoảng cách trong Flex/Grid)

```html
<div class="flex gap-4">gap: 16px</div>
<div class="flex gap-x-4">column-gap: 16px</div>
<div class="flex gap-y-2">row-gap: 8px</div>
```

---

## 📐 Width & Height (Kích thước)

### Width

| Class | CSS |
|-------|-----|
| `w-0` | width: 0 |
| `w-1` | width: 0.25rem (4px) |
| `w-4` | width: 1rem (16px) |
| `w-8` | width: 2rem (32px) |
| `w-12` | width: 3rem (48px) |
| `w-16` | width: 4rem (64px) |
| `w-24` | width: 6rem (96px) |
| `w-32` | width: 8rem (128px) |
| `w-48` | width: 12rem (192px) |
| `w-64` | width: 16rem (256px) |
| `w-full` | width: 100% |
| `w-screen` | width: 100vw |
| `w-1/2` | width: 50% |
| `w-1/3` | width: 33.333% |
| `w-2/3` | width: 66.666% |
| `w-1/4` | width: 25% |
| `w-3/4` | width: 75% |

### Height

```html
<div class="h-4">height: 16px</div>
<div class="h-screen">height: 100vh</div>
<div class="h-full">height: 100%</div>
<div class="min-h-screen">min-height: 100vh</div>
```

---

## 🎨 Colors (Màu sắc)

### Cú pháp: `{property}-{color}-{shade}`

**Properties:**
- `text-` : màu chữ
- `bg-` : màu nền
- `border-` : màu viền

**Colors & Shades:**

```html
<!-- Gray scale -->
<div class="text-gray-50">Rất nhạt</div>
<div class="text-gray-100">...</div>
<div class="text-gray-200">...</div>
<div class="text-gray-300">...</div>
<div class="text-gray-400">...</div>
<div class="text-gray-500">Trung bình</div>
<div class="text-gray-600">...</div>
<div class="text-gray-700">...</div>
<div class="text-gray-800">...</div>
<div class="text-gray-900">Rất đậm</div>

<!-- Các màu khác tương tự -->
<!-- red, orange, yellow, green, blue, indigo, purple, pink -->
```

### Ví dụ thực tế

```html
<!-- Text colors -->
<p class="text-gray-600">Màu chữ xám</p>
<p class="text-red-500">Màu chữ đỏ</p>
<p class="text-green-600">Màu chữ xanh lá</p>
<p class="text-blue-500">Màu chữ xanh dương</p>

<!-- Background colors -->
<div class="bg-white">Nền trắng</div>
<div class="bg-gray-100">Nền xám nhạt</div>
<div class="bg-blue-500">Nền xanh</div>
<div class="bg-green-500">Nền xanh lá</div>
<div class="bg-red-500">Nền đỏ</div>

<!-- Border colors -->
<div class="border border-gray-300">Viền xám</div>
<div class="border-2 border-blue-500">Viền xanh dày</div>

<!-- Đặc biệt -->
<div class="bg-transparent">Trong suốt</div>
<div class="text-white">Chữ trắng</div>
<div class="text-black">Chữ đen</div>
```

### Opacity

```html
<div class="bg-black bg-opacity-50">Nền đen 50% trong suốt</div>
<div class="bg-blue-500/50">Cách viết mới: blue với 50% opacity</div>
<div class="text-gray-500/75">Chữ xám với 75% opacity</div>
```

---

## 📝 Typography (Chữ)

### Font Size

| Class | Size |
|-------|------|
| `text-xs` | 12px |
| `text-sm` | 14px |
| `text-base` | 16px (default) |
| `text-lg` | 18px |
| `text-xl` | 20px |
| `text-2xl` | 24px |
| `text-3xl` | 30px |
| `text-4xl` | 36px |
| `text-5xl` | 48px |

### Font Weight

```html
<p class="font-thin">100</p>
<p class="font-light">300</p>
<p class="font-normal">400</p>
<p class="font-medium">500</p>
<p class="font-semibold">600</p>
<p class="font-bold">700</p>
<p class="font-extrabold">800</p>
```

### Text Align

```html
<p class="text-left">Căn trái</p>
<p class="text-center">Căn giữa</p>
<p class="text-right">Căn phải</p>
<p class="text-justify">Căn đều</p>
```

### Ví dụ kết hợp

```html
<h1 class="text-3xl font-bold text-gray-900">Tiêu đề lớn</h1>
<h2 class="text-xl font-semibold text-gray-800">Tiêu đề nhỏ</h2>
<p class="text-base text-gray-600">Đoạn văn bình thường</p>
<span class="text-sm text-gray-500">Chú thích nhỏ</span>
```

---

## 📦 Flexbox

### Container

```html
<div class="flex">Display: flex</div>
<div class="inline-flex">Display: inline-flex</div>
```

### Direction

```html
<div class="flex flex-row">Hàng ngang (default)</div>
<div class="flex flex-col">Hàng dọc</div>
<div class="flex flex-row-reverse">Hàng ngang ngược</div>
<div class="flex flex-col-reverse">Hàng dọc ngược</div>
```

### Justify Content (Trục chính)

```html
<div class="flex justify-start">Căn đầu</div>
<div class="flex justify-center">Căn giữa</div>
<div class="flex justify-end">Căn cuối</div>
<div class="flex justify-between">Cách đều, không gap 2 đầu</div>
<div class="flex justify-around">Cách đều, có gap 2 đầu</div>
<div class="flex justify-evenly">Cách đều hoàn toàn</div>
```

### Align Items (Trục phụ)

```html
<div class="flex items-start">Căn đầu</div>
<div class="flex items-center">Căn giữa</div>
<div class="flex items-end">Căn cuối</div>
<div class="flex items-stretch">Kéo dãn (default)</div>
```

### Ví dụ thực tế

```html
<!-- Navbar: logo trái, menu phải -->
<nav class="flex justify-between items-center p-4">
  <div class="logo">Logo</div>
  <div class="menu">Menu</div>
</nav>

<!-- Center cả 2 trục -->
<div class="flex justify-center items-center h-screen">
  <div>Centered content</div>
</div>

<!-- Card với items cách đều -->
<div class="flex gap-4">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
</div>

<!-- Sidebar layout -->
<div class="flex">
  <aside class="w-64">Sidebar</aside>
  <main class="flex-1">Main content</main>
</div>
```

### Flex Item Properties

```html
<!-- Flex grow/shrink -->
<div class="flex-1">Chiếm hết không gian còn lại</div>
<div class="flex-none">Không co giãn</div>
<div class="flex-grow">Chỉ grow</div>
<div class="flex-shrink-0">Không shrink</div>
```

---

## 📊 Grid

### Basic Grid

```html
<!-- Grid với số cột cố định -->
<div class="grid grid-cols-2">2 cột</div>
<div class="grid grid-cols-3">3 cột</div>
<div class="grid grid-cols-4">4 cột</div>
<div class="grid grid-cols-6">6 cột</div>
<div class="grid grid-cols-12">12 cột</div>
```

### Gap

```html
<div class="grid grid-cols-3 gap-4">Gap 16px tất cả hướng</div>
<div class="grid grid-cols-3 gap-x-4 gap-y-2">Gap khác nhau</div>
```

### Ví dụ thực tế

```html
<!-- Coin cards grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <div class="bg-white p-4 rounded-lg shadow">BTC</div>
  <div class="bg-white p-4 rounded-lg shadow">ETH</div>
  <div class="bg-white p-4 rounded-lg shadow">BNB</div>
  <div class="bg-white p-4 rounded-lg shadow">SOL</div>
</div>
```

---

## 🔲 Border & Rounded

### Border Width

```html
<div class="border">1px border</div>
<div class="border-2">2px border</div>
<div class="border-4">4px border</div>
<div class="border-0">Không border</div>
<div class="border-t">Border top only</div>
<div class="border-b-2">Border bottom 2px</div>
```

### Border Radius

```html
<div class="rounded-none">Không bo góc</div>
<div class="rounded-sm">Bo nhẹ (2px)</div>
<div class="rounded">Bo vừa (4px)</div>
<div class="rounded-md">Bo trung bình (6px)</div>
<div class="rounded-lg">Bo lớn (8px)</div>
<div class="rounded-xl">Bo rất lớn (12px)</div>
<div class="rounded-2xl">Bo cực lớn (16px)</div>
<div class="rounded-full">Bo tròn hoàn toàn</div>

<!-- Bo góc cụ thể -->
<div class="rounded-t-lg">Bo góc trên</div>
<div class="rounded-b-lg">Bo góc dưới</div>
<div class="rounded-l-lg">Bo góc trái</div>
<div class="rounded-r-lg">Bo góc phải</div>
```

---

## 🌫️ Shadow

```html
<div class="shadow-sm">Shadow nhỏ</div>
<div class="shadow">Shadow mặc định</div>
<div class="shadow-md">Shadow trung bình</div>
<div class="shadow-lg">Shadow lớn</div>
<div class="shadow-xl">Shadow rất lớn</div>
<div class="shadow-2xl">Shadow cực lớn</div>
<div class="shadow-none">Không shadow</div>
```

---

## 📱 Responsive Design

### Breakpoints

| Prefix | Min Width | Devices |
|--------|-----------|---------|
| (none) | 0px | Mobile first |
| `sm:` | 640px | Small tablets |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large screens |

### Cách sử dụng

```html
<!-- Mobile: 1 cột, Tablet: 2 cột, Desktop: 4 cột -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  <!-- items -->
</div>

<!-- Ẩn/hiện theo breakpoint -->
<div class="hidden md:block">Chỉ hiện từ tablet trở lên</div>
<div class="block md:hidden">Chỉ hiện trên mobile</div>

<!-- Padding responsive -->
<div class="p-2 md:p-4 lg:p-6">
  Padding tăng dần theo màn hình
</div>

<!-- Font size responsive -->
<h1 class="text-xl md:text-2xl lg:text-4xl">
  Responsive heading
</h1>
```

---

## 🖱️ Hover, Focus, Active States

```html
<!-- Hover -->
<button class="bg-blue-500 hover:bg-blue-600">
  Đậm hơn khi hover
</button>

<!-- Focus -->
<input class="border focus:border-blue-500 focus:ring-2 focus:ring-blue-200">

<!-- Active -->
<button class="bg-blue-500 active:bg-blue-700">
  Đậm hơn nữa khi click
</button>

<!-- Disabled -->
<button class="bg-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed">
  Xám khi disabled
</button>

<!-- Group hover -->
<div class="group">
  <div class="group-hover:text-blue-500">
    Đổi màu khi hover parent
  </div>
</div>
```

---

## 🎭 Transitions & Animations

### Transition

```html
<!-- Transition mặc định -->
<button class="transition bg-blue-500 hover:bg-blue-600">
  Smooth transition
</button>

<!-- Transition cụ thể -->
<div class="transition-colors duration-300">Chỉ màu</div>
<div class="transition-opacity duration-500">Chỉ opacity</div>
<div class="transition-transform duration-200">Chỉ transform</div>
<div class="transition-all duration-300">Tất cả</div>

<!-- Duration -->
<div class="transition duration-75">75ms</div>
<div class="transition duration-150">150ms</div>
<div class="transition duration-300">300ms</div>
<div class="transition duration-500">500ms</div>

<!-- Easing -->
<div class="transition ease-linear">Linear</div>
<div class="transition ease-in">Ease in</div>
<div class="transition ease-out">Ease out</div>
<div class="transition ease-in-out">Ease in-out</div>
```

### Transform

```html
<div class="hover:scale-105">Phóng to khi hover</div>
<div class="hover:scale-95">Thu nhỏ khi hover</div>
<div class="hover:-translate-y-1">Nâng lên khi hover</div>
<div class="hover:rotate-3">Xoay khi hover</div>
```

---

## 🧩 Common Patterns trong Project

### 1. Card Component

```html
<div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
  <h3 class="text-lg font-semibold text-gray-900">Title</h3>
  <p class="text-gray-600 mt-2">Description</p>
</div>
```

### 2. Button Styles

```html
<!-- Primary Button -->
<button class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
  Primary
</button>

<!-- Secondary Button -->
<button class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
  Secondary
</button>

<!-- Danger Button -->
<button class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
  Delete
</button>

<!-- Outline Button -->
<button class="px-4 py-2 border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors">
  Outline
</button>

<!-- Disabled Button -->
<button class="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed" disabled>
  Disabled
</button>
```

### 3. Input Styles

```html
<input 
  type="text"
  class="w-full px-4 py-2 border border-gray-300 rounded-lg 
         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
         placeholder-gray-400"
  placeholder="Enter text..."
/>

<!-- Input with error -->
<input 
  class="w-full px-4 py-2 border-2 border-red-500 rounded-lg 
         focus:outline-none focus:ring-2 focus:ring-red-200"
/>
<p class="text-red-500 text-sm mt-1">Error message</p>
```

### 4. Badge/Tag

```html
<!-- Success badge -->
<span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
  Thành công
</span>

<!-- Error badge -->
<span class="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
  Thất bại
</span>

<!-- Info badge -->
<span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
  Thông tin
</span>
```

### 5. Table

```html
<table class="w-full">
  <thead class="bg-gray-50">
    <tr>
      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
        Coin
      </th>
      <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
        Price
      </th>
    </tr>
  </thead>
  <tbody class="divide-y divide-gray-200">
    <tr class="hover:bg-gray-50">
      <td class="px-4 py-4">BTC</td>
      <td class="px-4 py-4 text-right">$75,000</td>
    </tr>
  </tbody>
</table>
```

### 6. Coin Price Change

```html
<!-- Giá tăng (xanh) -->
<span class="text-green-500">+2.5%</span>

<!-- Giá giảm (đỏ) -->
<span class="text-red-500">-1.3%</span>

<!-- Với icon -->
<span class="flex items-center text-green-500">
  <svg class="w-4 h-4 mr-1"><!-- arrow up --></svg>
  +2.5%
</span>
```

### 7. Modal/Dialog

```html
<!-- Overlay -->
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <!-- Modal content -->
  <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
    <h2 class="text-xl font-bold mb-4">Modal Title</h2>
    <p class="text-gray-600 mb-6">Modal content...</p>
    <div class="flex justify-end gap-2">
      <button class="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
      <button class="px-4 py-2 bg-blue-500 text-white rounded-lg">Confirm</button>
    </div>
  </div>
</div>
```

### 8. Sidebar + Main Layout

```html
<div class="flex min-h-screen">
  <!-- Sidebar -->
  <aside class="w-64 bg-gray-900 text-white p-4">
    <nav class="space-y-2">
      <a href="#" class="block px-4 py-2 rounded-lg hover:bg-gray-800">
        Dashboard
      </a>
      <a href="#" class="block px-4 py-2 rounded-lg bg-gray-800">
        Trade
      </a>
    </nav>
  </aside>
  
  <!-- Main content -->
  <main class="flex-1 bg-gray-100 p-6">
    Content here
  </main>
</div>
```

### 9. Loading Spinner

```html
<div class="flex items-center justify-center">
  <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
</div>
```

### 10. Empty State

```html
<div class="flex flex-col items-center justify-center py-12 text-gray-500">
  <svg class="w-16 h-16 mb-4"><!-- icon --></svg>
  <h3 class="text-lg font-medium">No data</h3>
  <p class="text-sm">There's nothing here yet.</p>
</div>
```

---

## 🔧 Cấu hình trong Project

### tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Custom colors
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
      },
      // Custom spacing
      spacing: {
        '72': '18rem',
        '84': '21rem',
      },
    },
  },
  plugins: [],
}
```

### index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom utilities */
@layer utilities {
  .text-gradient {
    @apply bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent;
  }
}

/* Custom components */
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors;
  }
  
  .card {
    @apply bg-white rounded-lg shadow p-6;
  }
}
```

---

## 📚 Cheat Sheet nhanh

```
SPACING:       p-{0-12}, m-{0-12}, gap-{0-12}
               px-, py-, pt-, pr-, pb-, pl-
               mx-, my-, mt-, mr-, mb-, ml-

WIDTH/HEIGHT:  w-{0-64}, w-full, w-screen, w-1/2, w-1/3
               h-{0-64}, h-full, h-screen

COLORS:        text-{color}-{shade}
               bg-{color}-{shade}
               border-{color}-{shade}
               Shades: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900

TYPOGRAPHY:    text-{xs|sm|base|lg|xl|2xl|3xl|4xl|5xl}
               font-{thin|light|normal|medium|semibold|bold}
               text-{left|center|right}

FLEXBOX:       flex, flex-row, flex-col
               justify-{start|center|end|between|around}
               items-{start|center|end|stretch}
               gap-{0-12}

GRID:          grid, grid-cols-{1-12}
               gap-{0-12}

BORDER:        border, border-{0|2|4}
               rounded, rounded-{sm|md|lg|xl|full}
               border-{color}

SHADOW:        shadow-{sm|md|lg|xl|2xl}

RESPONSIVE:    sm: md: lg: xl: 2xl:

STATES:        hover: focus: active: disabled:

TRANSITION:    transition, duration-{75|150|300|500}
```

---

**Tips:** Bookmark trang [TailwindCSS Documentation](https://tailwindcss.com/docs) để tra cứu nhanh!
