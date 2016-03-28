var mod = angular.module('mystock.services.notes', []);

mod.factory('notesService', function(notesCacheService, userService) {
    
    return {
        getNotes: function(ticker) {
            return notesCacheService.get(ticker);
        },
        addNote: function(ticker, note) {
            var stockNotes = [];
            
            if (notesCacheService.get(ticker)) {
                stockNotes = notesCacheService.get(ticker);
            }
            stockNotes.push(note);
            notesCacheService.put(ticker, stockNotes);
            
            if (userService.getUser()) {
                var notes = notesCacheService.get(ticker);
                userService.updateNotes(ticker, notes);
            }
        },
        deleteNote: function(ticker, index) {
            var stockNotes = [];
            
            stockNotes = notesCacheService.get(ticker);
            stockNotes.splice(index, 1);
            notesCacheService.put(ticker, stockNotes);
            
            if (userService.getUser()) {
                var notes = notesCacheService.get(ticker);
                userService.updateNotes(ticker, notes);
            }
        }
    }
});
