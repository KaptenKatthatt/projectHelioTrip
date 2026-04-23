Star Wars texture drop-in folder.

Expected runtime paths:

- `public/textures/star-wars/<body-id>/diffuse.jpg`
- `public/textures/star-wars/<body-id>/normal.jpg` (optional)
- `public/textures/star-wars/<body-id>/roughness.jpg` (optional)

Body IDs currently used:

- `death-star`
- `alderaan`
- `yavin`
- `yavin-4`
- `hoth`
- `endor`
- `kef-bir`
- `coruscant`
- `naboo`
- `tatooine`
- `kamino`
- `geonosis`
- `kashyyyk`
- `mustafar`

How to populate automatically:

1. Add licensed URLs in `scripts/starWarsTextureSources.ts`.
2. Run `npm run textures`.
