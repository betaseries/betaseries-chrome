###*
 * DB
###

class db

  ###*
   * Create/Get a store from localStorage
   * @param  {String} name
   * @return {store}
  ###
  store: (name) -> new store(@, name)

  ###*
   * Get a value from localStorage
   * @param  {String} field 
   * @param  {mixte} value 
   * @return {mixte}       
  ###
  get: (field, value) ->
    item = localStorage.getItem(field)
    if item
      JSON.parse(item)
    else
      value

  ###*
   * Set a value into localStorage
   * @param {String} field 
   * @param {mixte} value 
  ###
  set: (field, value) ->
    value = JSON.stringify(value)
    localStorage.setItem(field, value)

  ###*
   * Remove a value from localStorage
   * @param  {String} field       
  ###
  remove: (field) ->
    localStorage.removeItem(field)

###*
* STORE
###

class store

  ###*
   * Constructor
   * @param  {db} @db  
   * @param  {String} name 
  ###
  constructor: (@db, name) ->
    @_name = name;
    @_data = @db.get(name, [])

  ###*
   * Get data from a store
   * @param  {mixte} filter 
   * @return {mixte}        
  ###
  get: (filter) ->
    if typeof filter is "number"
      @_data[filter]
    else
      @_data

  ###*
   * Set data store (with timestamp)
   * @param {String} value 
  ###
  set: (value) ->
    d = new Date();

    @db.set(@_name, value)
    @db.set(@_name + "-timestamp", d.toDateString())

  ###*
   * Returns if data is not oudated
   * @return {Boolean}
  ###
  isReliable: ->
    d = new Date()
    @db.get(@_name + '-timestamp') is d.toDateString()

  ###*
   * Update one/many items from a store
   * @param  {Array} items      
  ###
  update: (items) ->
    for i in items
      for j in items[i]
        @_data[i][j] = items[i][j]
        @__save()

  ###*
   * Remove an item from a store
   * Remove a store
   * @param  {mixte} filter 
  ###
  remove: (filter) ->
    if typeof filter is "number"
      delete @_data[filter]
      @__save()
    else
      @db.remove(@_name)

  ###*
   * Save a store to localStorage
  ###
  __save: ->
    @db.set(@_name, @_data)