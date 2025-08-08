export default function () {
  GM_addStyle(`
.item_box .item_description .user_des .title[data-v-2e86094d]:hover {
  overflow: visible;
  z-index: 10;
  width: fit-content;
  background: white;
  border-color: black;
}

.item_box .item_description .user_des .title[data-v-2e86094d] {
  position: relative;
  border-radius: 2px;
  border: transparent 1px solid;
}

.card-box .card-list .card-item[data-v-14260fc2]:has(.title:hover),
.item_box .item_description[data-v-2e86094d]:has(.title:hover),
.item_box .item_description .user_des[data-v-2e86094d]:has(.title:hover) {
  overflow: visible;
}

.item_box .item_cover[data-v-2e86094d] {
  border-radius: 8px 8px 0 0;
}

.item_box .item_description[data-v-2e86094d]:has(.title:hover) {
  
  border-radius:  0 0 8px 8px;
}

`)
}
