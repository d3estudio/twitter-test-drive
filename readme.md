```
Scope: Public
/<handle>/<id (14b)>/<campaign-slug>

Scope: User (Brand)
/                                           -> list
/create                                     -> create
/preview                                    -> preview
/<id>/json                                  -> Download JSON
/<id>/csv                                   -> Download CSV
/all/json                                   -> Download JSON (All campaigns)
/all/csv                                    -> Download CSV (All campaigns)

Scope: Admin
/admin                                            -> List (Brands)
/admin/<brand-handle>                             -> List (Campaigns belonging to <brand-handle>)
/admin/<brand-handle>/create                      -> create
/admin/<brand-handle>/<id>/json                   -> Download JSON
/admin/<brand-handle>/<id>/csv                    -> Download CSV
/admin/<brand-handle>/all/json                    -> Download JSON (All campaigns)
/admin/<brand-handle>/all/csv                     -> Download CSV (All campaigns)
/admin/<brand-handle>/<id>/delete                 -> (POST!)
```

