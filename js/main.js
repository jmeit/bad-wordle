document.addEventListener( 'DOMContentLoaded', function(){

    for( let i=0; i<5; i++ )
    {
        document.querySelector( '.tiles-wrap' )
            .append(
                document.querySelector( '.tiles.row' ).cloneNode( true )
            );
    }
    
    const statusEls = document.querySelectorAll( '.status-selector' );
    for( let i=0; i<statusEls.length; i++ )
    {
        const stEl = statusEls[i];
        stEl.name = `status-${Math.floor(i/3)}`;
        if( stEl.checked )
        {
            stEl
                .parentNode
                .parentNode
                .querySelector('.letter')
                    .dataset.status = stEl.value;
        }

        stEl.addEventListener(
            'click',
            e => {
                stEl
                    .parentNode
                    .parentNode
                    .querySelector('.letter')
                        .dataset.status = stEl.value;
            },
            false
        );
    }

    const letterEls = document.querySelectorAll( '.letter' )
    for( let i=0; i<letterEls.length; i++ )
    {
        const ltrEl = letterEls[i];
        ltrEl.addEventListener(
            'keyup',
            function( e ){
                const keys = {
                    backspace: 8
                };

                if( e.keyCode == keys.backspace && letterEls[i-1] )
                {
                    letterEls[i-1].focus();
                }
            },
            false
        );
        ltrEl.addEventListener(
                'input',
                function( e ){
                    if( !e.data || e.data.trim().length != 1 ) return;

                    this.value = e.data.substr(0,1);
                    if( letterEls[i+1] )
                    {
                        letterEls[i+1].focus();
                    }
                },
                false
            );
    }
    
    document.getElementById('word-length-form')
        .addEventListener(
            'submit',
            function( e ){
                e.preventDefault();

                let regexSearcherStr = '^';
                const board = (new Array(5)).fill( false );
                const exclude = new Set();
                const lost = new Set();

                const rows = document.querySelectorAll('.letters.row')
                for( let i=0; i<rows.length; i++ )
                {
                    const row = rows[i];
                    const letters = row.querySelectorAll('.letter');
                    
                    // Stop at empty row
                    if( letters[0].value.trim() == "" ){ break; }

                    for( let j=0; j<letters.length; j++ )
                    {
                        const ltr = letters[j];
                        const status = ltr.dataset.status;
                        if( status == 'found' )
                        {
                            board[j] = ltr.value;
                        }
                        else if( status == 'lost' )
                        {
                            lost.add( ltr.value );
                            if( typeof board[j] != 'string' )
                            {
                                board[j] = board[j] || new Set();
                                board[j].add( ltr.value );
                            }
                        }
                        else if( ltr.value.trim().length == 1 )
                        {
                            exclude.add( ltr.value );
                        }
                    }
                }

                exclude.forEach( l => regexSearcherStr += `(?!.*${l})` );
                lost.forEach( l => regexSearcherStr += `(?=.*${l})` );
                
                for( let i=0; i<board.length; i++ )
                {
                    if( board[i] instanceof Set )
                    {
                        regexSearcherStr += `[^${Array.from( board[i] ).join('')}]`;
                    }
                    else if( typeof board[i] == 'string' )
                    {
                        regexSearcherStr += board[i];
                    }
                    else
                    {
                        regexSearcherStr += '\\w';
                    }
                }

                regexSearcherStr += '$';

                const possibleWords = window.wordlist.filter( x=> x.search( new RegExp( regexSearcherStr, 'i' ) ) != -1 );
                
                const pwEl = document.getElementById(`possible-words`);
                const maxWords = 20;
                if( possibleWords.length < 1 )
                {
                    pwEl.value = `No words found.`;
                }
                else if( possibleWords.length > maxWords ){
                    pwEl.value = `More than ${maxWords} words found.\nTry another guess to isolate the possible answers.`;
                }
                else
                {
                    pwEl.value = possibleWords.join('\n');
                }
                pwEl.style.height = "";
                pwEl.style.height = pwEl.scrollHeight + "px";

                return false;
            },
            false
        );

        document.getElementById( 'reset' )
            .addEventListener(
                'click',
                resetBoard,
                false
            );

        resetBoard()
    
}, false );

function resetBoard()
{
    document.querySelectorAll( '.status-selector' )
        .forEach( (stEl,i) => stEl.checked = i%3 == 0 );
    
    document.querySelectorAll( '.letter' )
        .forEach( ltrEl => {
            ltrEl.value = "";
            ltrEl.dataset.status = "exclude"
        } );

    document.getElementById(`possible-words`)
        .value = "";

    document.getElementById(`possible-words`)
        .style.height = "";
}

Array.prototype.random = function() {
    return this[Math.floor( Math.random() * ( this.length - 1 ) )];
}