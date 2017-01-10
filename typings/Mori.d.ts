/*
The MIT License (MIT)

Copyright (c) 2014 François de Campredon

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/


declare module 'mori' {

    class MoriObject<T> {
        private ___guard : any;
    }

    /**
     * Unlike JavaScript objects Mori PersistentHashMap support complex keys.
     * It's recommended that you only use immutable values for your keys - numbers, strings or a Mori collection.
     */
    class HashMap<K, V> extends MoriObject<V> {
        private ___guardHashMap: any;

        /**
         * Returns the keys of a hash map as a sequence.
         */
        keys(): K[];
        /**
         * Returns the values of a hash map as a sequence.
         */
        vals(): V[];
    }

    class Collection<T> extends MoriObject<T> {
        private ___guardCollection : any;
    }

    /**
     * Vectors support efficient addition at the end. They also support efficient random access.
     * You will probaly use mori.vector much more often than mori.list
     */
    class Vector<T> extends Collection<T> {
        private ___guardVector : any;

    }

    /**
     * Lists support efficient addition at the head of the list.
     * It's important to remember that the cost of operations like mori.nth will be linear in the size of the list.
     */
    class List<T> extends Collection<T> {
        private ___guardList : any;
    }



    /**
     * Immutable Set
     */
    class Set<T> extends Collection<T> {
        private ___guardSet: any;

        /**
         * Removes an element from a set.
         */
        disj(t: T): Set<T>;
    }

    /**
     * Like set but keeps its elements ordered.
     */
    class SortedSet<T> extends Collection<T> {
        private ___guardSortedSet: any;
    }

    class Range extends Collection<number> {
        private ___guardRange: any;
    }

    /**
     * Test whether two values are equal.
     * Works on all Mori collections.
     * Note that two seqable values will be tested on deep equality of their contents.
     */
    function equals<T>(a: MoriObject<T>, b: MoriObject<T>): boolean;

    /**
     * Returns the hash code for a value. Values for which mori.equals returns true have identical hash codes.
     */
    function hash(a: MoriObject<any>): string;

    /**
     * Test if something is a list-like collection. Lists support afficient adding to the head.
     */
    function isList(a: MoriObject<any>): boolean;

    /**
     * Test if something is a sequence (i.e. iterable)
     */
    function isSeq(a: MoriObject<any>): boolean;

    /**
     * Test if something is a vector-like collection. Vectors support random access. It is efficient to add to the end of a vector.
    */
    function isVector(a: MoriObject<any>): boolean;


    /**
     * Test if something is a map-like collection. Maps support random access and arbitrary keys.
     */
    function isMap(a: MoriObject<any>): boolean;

    /**
     *  Test if something is a hash set.
     */
    function isSet(a: MoriObject<any>): boolean;

    /**
     *  Test if something is a collection - lists, maps, sets, vectors are all collections.
     */
    function isCollection(a: MoriObject<any>): boolean;

    /**
     * Test if something is sequential. For example vectors are sequential but are not sequences.
     * They can however be converted into something iterable by calling seq on them.
     */
    function isSequential(a: MoriObject<any>): boolean;

    /**
     * Test if something is associative - i.e. vectors, maps, and sets.
     */
    function isAssociative(a: MoriObject<any>): boolean;

    /**
     * Test if something can give its count in O(1) time.
     */
    function isCounted(a: MoriObject<any>): boolean;

    /**
     * Test if something is indexed - i.e. vectors.
     */
    function isIndexed(a: MoriObject<any>): boolean;

    /**
     * Test if something is reduceable.
     */
    function isReduceable(a: MoriObject<any>): boolean;

    /**
     * Test if something can be coerced into something iterable.
     */
    function isSeqable(a: MoriObject<any>): boolean;

    /**
     * Test if something can be reversed in O(1) time.
     */
    function isReversible(a: MoriObject<any>): boolean;

    /**
     * Constructs an immutable list. Lists support efficient addition at the head of the list.
     * It's important to remember that the cost of operations like mori.nth will be linear in the size of the list.
     */
    function list<T>(...contents: T[]): List<T>;

    /**
     * Constructs an immutable vector. Vectors support efficient addition at the end. They also support efficient random access.
     * You will probaly use mori.vector much more often than mori.list
     */
    function vector<T>(...contents: T[]): Vector<T>;

    /**
     * Constructs an immutable hash map.
     * Unlike JavaScript objects Mori PersistentHashMap support complex keys.
     * It's recommended that you only use immutable values for your keys - numbers, strings or a Mori collection.
     */
    function hashMap<K,V>(...rest: any[]): HashMap<K,V>;


    /**
     * Constructs a collection of unique items.
     * You may pass in any seqable type - this includes JavaScript arrays and strings.
     * There are several operations unique to sets which do not apply to the other collections.
     */
    function set<T>(...rest: T[]): Set<T>;



    /**
     * Like set but keeps its elements ordered.
     */
    function sortedSet <T>(...rest: T[]): SortedSet<T>;


    /**
     * Construct a lazy range of values. If not given an end will produce an infinite lazy sequence. A step may be specified.
     */
    function range(a :number, b?: number): Range;


    /**
     * Add items at the begining of the list
     */
    function conj<T>(list: List<T>, ...rest: T[]): List<T>;
    /**
     * Add items at the end of the vector
     */
    function conj<T>(vector: Vector<T>, ...rest: T[]): Vector<T>;
    /**
     * Add an item in the Set
     */
    function conj<T>(set: Set<T>, ...rest: T[]): Set<T>;
    /**
     * Add an item in the Set
     */
    function conj<T>(sortedSet: SortedSet<T>, ...rest: T[]): SortedSet<T>;
    /**
     * Add and entry to the map
     */
    function conj<K,V>(map: HashMap<K,V>, ...rest: any[]): HashMap<K,V>;


    /**
     * Add all the items in the second collection to the first one as if calling mori.conj repeatedly.t
     */
    function into<T extends Collection<any>, U extends Collection<any>>(a: T, b: U):U;


    /**
     * Associate a new key-value pair in an associative collection.
     */
    function assoc<T>(vector: Vector<T>, index: number, value: T): Vector<T>;
    /**
     * Associate a new key-value pair in an associative collection.
     */
    function assoc<K,V>(map: HashMap<K,V>, key: K, value: V): HashMap<K,V>;


    /**
     * Removes keys from an associative collection.
     */
    function dissoc<K,V>(vector: HashMap<K,V>, ...keys: K[]): HashMap<K,V>;

    /**
     * Remove everything from a collection.
     */
    function empty<T extends MoriObject<any>>(t: T): T;

    /**
     * Retrieve a value from a collection.
     */
    function get<T>(list: List<T>, index: number, notFound?: T): T;
    /**
     * Retrieve a value from a collection.
     */
    function get<T>(vector: Vector<T>, index: number, notFound?: T): T;
    /**
     * Retrieve a value from a collection.
     */
    function get<K,V>(map: HashMap<K,V>, key: K, notFound?: V): V;


    /**
     * Retrieve a value from a nested collection. keys may be any seqable object.
     */
    function getIn<T>(list: List<T>, keys: { 0 :number; 1: any}, notFound?: T): T;
    /**
     * Retrieve a value from a nested collection. keys may be any seqable object.
     */
    function getIn<T>(vector: Vector<T>, keys: { 0 :number; 1: any}, notFound?: T): T;
    /**
     * Retrieve a value from a nested collection. keys may be any seqable object.
     */
    function getIn<K,V>(map: HashMap<K,V>, keys: { 0 : K; 1: any}, notFound?: V): V;



    /**
     * Returns true if the collection has the given key/index. Otherwise, returns false.
     */
    function hasKey<T>(list: List<T>, index: number): boolean;
    /**
     * Returns true if the collection has the given key/index. Otherwise, returns false.
     */
    function hasKey<T>(vector: Vector<T>, index: number): boolean;
    /**
     * Returns true if the collection has the given key/index. Otherwise, returns false.
     */
    function hasKey<T>(set: Set<T>, key: T): boolean;
    /**
     * Returns true if the collection has the given key/index. Otherwise, returns false.
     */
    function hasKey<T>(sortedSet: SortedSet<T>, key: T):boolean;
    /**
     * Returns true if the collection has the given key/index. Otherwise, returns false.
     */
    function hasKey<K>(map: HashMap<K, any>, key: K): boolean;


    /**
     * Returns the key value pair as an array for a given key. Returns null if that key isn't present.
     */
    function find<T>(list: List<T>, keys: number): { 0 :number; 1: T};
    /**
     * Returns the key value pair as an array for a given key. Returns null if that key isn't present.
     */
    function find<T>(vector: Vector<T>, keys: number): { 0 :number; 1: T};
    /**
     * Returns the key value pair as an array for a given key. Returns null if that key isn't present.
     */
    function find<K,V>(map: HashMap<K,V>, keys: K): { 0 :K; 1: V};



    /**
     * Get the value at the specified index. Complexity depends on the collection.
     * nth is essentially constant on vector, but linear on lists.
     * For collections which are not sequential like sets and hash-map, the collection will be coerced into a sequence first.
     */
    function nth<T>(list: MoriObject<T>, index: number): T;



    /**
     * Get the last value in a collection, in linear time.
     */
    function last<T>(collection: MoriObject<T>): T;



    /**
     * Convenience function for assoc'ing nested associative data structures. keys may be any seqable.
     */
    function assocIn<T>(vector: Vector<T>, keys: { 0 :number; 1: any}, value: any): Vector<T>;
    /**
     * Convenience function for assoc'ing nested associative data structures. keys may be any seqable.
     */
    function assocIn<K,V>(vector: HashMap<K,V>, keys: { 0 : K; 1: any}, value:  any): HashMap<K,V>;



    function updateIn(...rest: any[]): any;


    /**
     * Returns the length of the collection.
     */
    function count(collection: MoriObject<any>): number;

    /**
     * Returns true if the collection is empty.
     */
    function isEmpty(collection: MoriObject<any>): boolean;



    /**
     * Returns either the first item of a list or the last item of a vector.
     */
    function peek<T>(list: List<T>): T;
    /**
     * Returns either the first item of a list or the last item of a vector.
     */
    function peek<T>(vector: Vector<T>): T;

    /**
     * Returns either a list with the first item removed or a vector with the last item removed.
     */
    function pop<T>(list: List<T>): List<T>;
    /**
     * Returns either a list with the first item removed or a vector with the last item removed.
     */
    function pop<T>(vector: Vector<T>): Vector<T>;


    /**
     * Takes two seqable objects and constructs a hash map.
     * The first seqable provides the keys, the second seqable the values.
     */
    function zipmap<K,V>(keys: K[], values: V[]): HashMap<K,V>;

    /**
     * Returns a reversed sequence of a collection.
     */
    function reverse<T>(obj: MoriObject<T>): Seq<T>;




    /**
     * Returns a subsection of a vector in constant time.
     */
    function subvec<T>(vector: Vector<T>, index: number, length?: number): Vector<T>

    /**
     * Returns the union of two sets.
     */
    function union<T>(setA:Set<T>, setB: Set<T>): Set<T>;
    /**
     * Returns the intersection of two sets.
     */
    function intersection<T>(setA:Set<T>, setB: Set<T>): Set<T>;

    /**
     * Returns the difference between two sets.
     */
    function difference<T>(setA:Set<T>, setB: Set<T>): Set<T>;

    /**
     * Returns true if seta is a subset of setb.
     */
    function isSubset<T>(setA:Set<T>, setB: Set<T>): boolean;

    /**
     * Returns true if seta is a superset of setb.
     */
    function isSuperset<T>(setA:Set<T>, setB: Set<T>): boolean;



    /**
     * Returns the first element in a collection.
     */
    function first<T>(collection: MoriObject<T>): T;

    /**
     * Returns the first element in a collection.
     */
    function rest<T extends MoriObject<any>>(collection: T): T;


    class Seq<T> extends Collection<T> {
        private __guardSeq:any;
    }

    /**
     * Converts a collection whether Mori or JavaScript primitive into a sequence.
     */
    function seq<T>(value: T[]): Seq<T>;
    /**
     * Converts a collection whether Mori or JavaScript primitive into a sequence.
     */
    function seq(value: string): Seq<string>;
    /**
     * Converts a collection whether Mori or JavaScript primitive into a sequence.
     */
    function seq<T>(col: Collection<T>): Seq<T>;


    /**
     * Converts a collection into a sequence and adds a value to the front.
     */
    function cons<T>(value: T, col: Collection<T>): Seq<T>;


    /**
     * Converts its arguments into sequences and concatenates them.
     */
    function concat<T>(...rest: Collection<T>[]): Seq<T>;


    /**
     * Converts an arbitrarily nested collection into a flat sequence.
     */
    function flatten<T>(...rest: any[]): Seq<T>;


    /**
     * Converts a seqable collection, including Mori seqs back into a JavaScript array. Non-lazy.
     */
    function intoArray<T>(col: Collection<T>): T[];

    /**
     * Iterate over a collection. For side effects.
     */
    function each<T>(col: Collection<T>, callback: (value: T) => void): void;

    /**
     * Return a lazy sequence that represents the original collection with f applied to each element.
     * Note that map can take multiple collections This obviates the need for Underscore.js's zip.
     */
    function map<T, U>(callback: (value: T) => U, ...rest: T[]): Seq<U>;


    /**
     * Applies f, which must return a collection, to each element of the original collection(s) and concatenates the results into a single sequence.
     */
    function mapcat<T, U>(callback: (value: T) => Collection<U>, ...rest: T[]): Seq<U>;


    /**
     * Return a lazy sequence representing the original collection  filtered of elements which did not return a truthy value for pred.
     * Note that Mori has a stricter notion of truth than JavaScript. Only false, undefined, and null are considered false values.
     */
    function filter<T>(callback: (value: T) => boolean, collection: Collection<T>[]): Seq<T>;
    /**
     * Return a lazy sequence representing the original collection  filtered of elements which did not return a truthy value for pred.
     * Note that Mori has a stricter notion of truth than JavaScript. Only false, undefined, and null are considered false values.
     */
    function filter<T>(callback: (value: T) => boolean, collection: Collection<T>): Seq<T>;


    /**
     * The inverse of filter. Return a lazy sequence representing the original collction filtered of elements which returned a truthy value for pred.
     * Note that Mori has a stricter notion of truth than JavaScript. Only false, undefined, and null are considered false values.
     */
    function remove<T>(callback: (value: T) => boolean, collection: Collection<T>[]): Seq<T>;
    /**
     * The inverse of filter. Return a lazy sequence representing the original collction filtered of elements which returned a truthy value for pred.
     * Note that Mori has a stricter notion of truth than JavaScript. Only false, undefined, and null are considered false values.
     */
    function remove<T>(callback: (value: T) => boolean, collection: T[]): Seq<T>;

    /**
     * Accumulate a collection into a single value. f should be a function of two arguments, the first will be the accumulator, the second will be next value in the sequence.
     */
    function reduce<T,R>(callbackfn: (previousValue: R, currentValue: T) => R, initialValue: R, collection: Collection<T>): R;
    /**
     * Accumulate a collection into a single value. f should be a function of two arguments, the first will be the accumulator, the second will be next value in the sequence.
     */
    function reduce<T,R>(callbackfn: (previousValue: R, currentValue: T) => R, collection: Collection<T>): R;


    /**
     * A variant of reduce for map-like collections, specifically hash maps and vectors.
     */
    function reduceKv<T,R>(callbackfn: (previousValue: R, index: number, currentValue: T) => R, initialValue: R, vector: Vector<T>[]): R;
    /**
     * A variant of reduce for map-like collections, specifically hash maps and vectors.
     */
    function reduceKv<T,R>(callbackfn: (previousValue: R, index: number, currentValue: T) => R, vector: Vector<T>[]): R;


    /**
     * A variant of reduce for map-like collections, specifically hash maps and vectors.
     */
    function reduceKv<K,V,R>(callbackfn: (previousValue: R, index: K, currentValue: V) => R, initialValue: R, map: HashMap<K, V>[]): R;
    /**
     * A variant of reduce for map-like collections, specifically hash maps and vectors.
     */
    function reduceKv<K,V,R>(callbackfn: (previousValue: R, index: K, currentValue: V) => R, map: HashMap<K, V>[]): R;


    /**
     * Takes n elements from a colletion. Note that coll could be an infinite sequence. This function returns a lazy sequence.
     */
    function take<T>(n :number, col: Collection<T>): Seq<T>;

    /**
     * Takes elements from a collection as long as the function pred returns a value other than false, null or undefined. Returns a lazy sequence.
     */
    function takeWhile<T>(callback: (value: T) => boolean, col: Collection<T>): Seq<T>;



    /**
     * Drop n elements from a collection. Returns a lazy sequence.
     */
    function drop<T>(n :number, col: Collection<T>): Seq<T>;


    /**
     * Drops elements from a collection as long as the function pred returns a value other than false, null or undefined. Returns a lazy sequence.
     */
    function dropWhile<T>(callback: (value: T) => boolean, col: Collection<T>): Seq<T>;



    /**
     * Applies the function pred to the elements of the collection in order and returns the first result which is not false, null or undefined.
     */
    function some<T>(callback: (value: T) => boolean, col: Collection<T>): boolean;

    /**
     * Returns true if the result of applying the function pred to an element of the collection is never false, null or undefined.
     */
    function every<T>(callback: (value: T) => boolean, col: Collection<T>): boolean;


    /**
     * Sorts the collection and returns a sequence. The comparison function to be used can be given as the first argument.
     */
    function sort<T>(col: Collection<T>): Seq<T>;
    /**
     * Sorts the collection and returns a sequence. The comparison function to be used can be given as the first argument.
     */
    function sort<T>(callback: (a: T, b: T) => number, col: Collection<T>): Seq<T>;


    /**
     * Sorts the collection by the values of keyfn on the elements and returns a sequence.
     * The comparison function to be used can be given as the first argument.
     */
    function sortBy<V, T>(keyFn: (value: T) => V, comparFn: (value: V) => number, col: Collection<T>): Seq<T>;


    /**
     * Interpose a value between all elements of a collection.
     */
    function interpose<T>( obj: T, col: Collection<T>): Seq<T>;


    /**
     * Interleave two or more collections. The size of the resulting lazy sequence is determined by the smallest collection.
     */
    function interleave<T>( interleave: Collection<T>, col: Collection<T>): Seq<T>;
    /**
     * Interleave two or more collections. The size of the resulting lazy sequence is determined by the smallest collection.
     */
    function interleave<T>( array: T[], col: Collection<T>): Seq<T>;

    /**
     * Creates a lazy sequences of x, f(x), f(f(x)), ...
     */
    function iterate<T>( func: (val:T) => T, inial: T): Seq<T>;

    /**
     * Return a lazy of sequence of the value repeated. If given n, the value will only be repeated n times.
     */
    function repeat<T>(n: number, val: T): Seq<T>;

    /**
     * Return a lazy of sequence of the value repeated. If given n, the value will only be repeated n times.
     */
    function repeat<T>(val: T): Seq<T>;


    /**
     * Return a lazy of sequence of calling f, a function which takes no arguments (presumably for side effects).
     * If given n, the function will only be repeated n times.
     */
    function repeatedly<T>(n: number, fn: () => T): Seq<T>;

    /**
     * Return a lazy of sequence of calling f, a function which takes no arguments (presumably for side effects).
     * If given n, the function will only be repeated n times.
     */
    function repeatedly<T>( fn: () => T): Seq<T>;


    /**
     * Partition a seqable collection into groups of n items.
     * An optional step parameter may be provided to specify the amount of overlap.
     * An additional pad element can be provided when the final group of items is too small.
     */
    function partion<T>( n: number, collection: Collection<T>): Seq<T>;
    /**
     * Partition a seqable collection into groups of n items.
     * An optional step parameter may be provided to specify the amount of overlap.
     * An additional pad element can be provided when the final group of items is too small.
     */
    function partion<T>( n: number, step: number, collection: Collection<T>): Seq<T>;
    /**
     * Partition a seqable collection into groups of n items.
     * An optional step parameter may be provided to specify the amount of overlap.
     * An additional pad element can be provided when the final group of items is too small.
     */
    function partion<T>( n: number, step: number, pad: number, collection: Collection<T>): Seq<T>;

    /**
     * Partition a seqable collection with a new group being started whenever the value of the function f changes.
     */
    function partion<T>( fn: (val :T) => any, collection: Collection<T>): Seq<T>;


    /**
     * Returns a map of the items grouped by the result of applying f to the element.
     */
    function groupBy<T>( fn: (val :T) => any, collection: Collection<T>): Seq<T>;


    /**
     * There are many array-like JavaScript objects which are not actually arrays.
     * To give these objects a uniform interface you can wrap them with mori.primSeq.
     * The optional argument index may be used to specify an offset. Note this is not necesary for arrays or strings.
     */
    function primSeq(val :any, index? :number): any;


    /**
     * A function which simply returns its argument
     */
    function identity<T>(val: T): T;

    /**
     * Makes a function that takes any number of arguments and simply returns x.
     */
    function constantly<T>(val: T): (...rest: any[]) => T;

    /**
     * Adds one to its argument.
     */
    function inc(number: number): number;

    /**
     * Subtracts one from its argument.
     */
    function dec(number: number): number;

    /**
     * Returns true if the argument is divisible by 2.
     */
    function isEven(number: number): boolean;

    /**
     * Returns true if the argument is not divisible by 2.
     */
    function isOdd(number: number): boolean;


    /**
     * Function composition. The result of mori.comp(f, g)(x) is the same as f(g(x)).
     */
    function comp<T,U,Z>(f: (t: T) => U, g: (z: Z) => T): (z: Z) => U;

    /**
     * Takes a series of functions and creates a single function which represents their "juxtaposition".
     * When this function is called, will return the result of each function applied to the arguments in a JavaScript array.
     */
    function juxt( ...rest: any[]): any;

    /**
     * This allows you to create functions that work on a heterogenous collection and return a new collection of the same arity.
     * It is an relative of juxt. Like juxt it takes a series of functions and returns a new function. Unlike juxt the resulting function takes a sequence.
     * The functions and sequence are zipped together and invoked.
     */
    function knit( ...rest: any[]): any;


    /**
     * Allows threading a value through a series of functions.
     */
    function pipeline( ...rest: any[]): any;


    /**
     * Partial application. Will return a new function in which the provided arguments have been partially applied.
     */
    function partial( ...rest: any[]): any;

    /**
     * Curry arguments to a function.
     */
    function curry( ...rest: any[]): any


    /**
     * Takes a function f and returns a new function that upon receiving an argument, if null, will be replaced with x.
     * fnil may take up to three arguments.
     */
    function fnil( ...rest: any[]): any


    /**
     * Recursively transforms JavaScript arrays into Mori vectors, and JavaScript objects into Mori maps
     */
    function toClj ( js: any): MoriObject<any>;


    /**
     * Recursively transforms Mori values to JavaScript. sets/vectors/lists become Arrays, Keywords and Symbol become Strings, Maps become Objects.
     * Arbitrary keys are encoded to by key->js.
     */
    function toJs ( obj: MoriObject<any>): any


}
