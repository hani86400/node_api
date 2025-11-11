// process_items.js
// simple in-memory CRUD store

// our dataset
export const items = [
  { id: 1, name: "user1", password: "password1", email: "user1@abc.com" },
  { id: 2, name: "user2", password: "password2", email: "user2@abc.com" },
  { id: 3, name: "user3", password: "password3", email: "user3@abc.com" }
];

let items_counter = items.length;

// ---------- handlers ----------

// GET /api/items
export function process_get_all_items(req, res) {
  res.status(200).json(items);
}

// GET /api/items/:id
export function process_get_item(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const item = items.find(it => it.id === id);
  if (!item) return res.status(404).json({ error: `Item ${id} not found` });

  res.json(item);
}

// POST /api/items
export function process_add_item(req, res) {
  const { name, password, email } = req.body;
  if (!name || !password || !email)
    return res.status(400).json({ error: "Missing required fields" });

  items_counter += 1;
  const item = { id: items_counter, name, password, email };
  items.push(item);
  res.status(201).json(item);
}

// PUT /api/items/:id
export function process_update_item(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const item = items.find(it => it.id === id);
  if (!item) return res.status(404).json({ error: `Item ${id} not found` });

  const { name, password, email } = req.body;
  if (!name || !password || !email)
    return res.status(400).json({ error: "Missing fields" });

  Object.assign(item, { name, password, email });
  res.json(item);
}

// DELETE /api/items/:id
export function process_delete_item(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const index = items.findIndex(it => it.id === id);
  if (index === -1)
    return res.status(404).json({ error: `Item ${id} not found` });

  const [removed] = items.splice(index, 1);
  res.json(removed);
}
